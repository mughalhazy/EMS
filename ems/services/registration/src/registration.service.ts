import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { buildDistributedTraceContext } from '../../audit/src/distributed-tracing';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { OrderEntity } from '../../commerce/src/entities/order.entity';
import { EventSettingEntity } from '../../event/src/entities/event-setting.entity';
import { RegistrationQuestionEntity } from '../../event/src/entities/registration-question.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { CreateRegistrantProfileDto } from './dto/create-registration.dto';
import { RegistrantProfileEntity } from './entities/registrant-profile.entity';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrationStatus } from './entities/registration-status.entity';
import { RegistrationEventsPublisher } from './registration-events.publisher';

export interface RegisterForEventInput {
  tenantId: string;
  eventId: string;
  userId: string;
  ticketId: string;
  orderId?: string;
  orderItemId?: string;
  attendeeIndex?: number;
  profile: CreateRegistrantProfileDto;
}

export interface UpdateRegistrationInput {
  ticketId?: string;
}

export interface RegistrationApprovalInput {
  actorUserId: string | null;
}

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    @InjectRepository(EventSettingEntity)
    private readonly eventSettingRepository: Repository<EventSettingEntity>,
    @InjectRepository(RegistrantProfileEntity)
    private readonly registrantProfileRepository: Repository<RegistrantProfileEntity>,
    private readonly registrationEventsPublisher: RegistrationEventsPublisher,
    private readonly auditService: AuditService,
  ) {}

  async register(input: RegisterForEventInput): Promise<RegistrationEntity> {
    try {
      return await this.registrationRepository.manager.transaction(async (manager) => {
        const registrationRepo = manager.getRepository(RegistrationEntity);
        const eventSettingRepo = manager.getRepository(EventSettingEntity);
        const registrantProfileRepo = manager.getRepository(RegistrantProfileEntity);

        await this.assertRegistrationInput(input, {
          ticketRepository: manager.getRepository(TicketEntity),
          orderRepository: manager.getRepository(OrderEntity),
          orderItemRepository: manager.getRepository(OrderItemEntity),
          registrationQuestionRepository: manager.getRepository(RegistrationQuestionEntity),
        });

      const existing = await registrationRepo.findOne({
        where: {
          tenantId: input.tenantId,
          eventId: input.eventId,
          userId: input.userId,
          ticketId: input.ticketId,
        },
      });

      if (existing && existing.status !== RegistrationStatus.CANCELLED) {
        return existing;
      }

      const eventSetting = await eventSettingRepo
        .createQueryBuilder('eventSetting')
        .setLock('pessimistic_write')
        .where('eventSetting.tenantId = :tenantId', { tenantId: input.tenantId })
        .andWhere('eventSetting.eventId = :eventId', { eventId: input.eventId })
        .getOne();

      const status = eventSetting?.capacity === null
        ? RegistrationStatus.CONFIRMED
        : RegistrationStatus.PENDING;

      const registration = registrationRepo.create({
        ...(existing ?? {}),
        ...input,
        status,
        orderId: input.orderId ?? null,
        orderItemId: input.orderItemId ?? null,
        attendeeIndex: input.attendeeIndex ?? null,
      });

      const savedRegistration = await registrationRepo.save(registration);

      const profile = registrantProfileRepo.create({
        tenantId: input.tenantId,
        eventId: input.eventId,
        registrationId: savedRegistration.id,
        name: input.profile.name,
        contact: {
          email: input.profile.contact.email.trim().toLowerCase(),
          phone: input.profile.contact.phone,
        },
        answers: input.profile.answers,
      });
      await registrantProfileRepo.save(profile);

      const registrationTrace = buildDistributedTraceContext();

      await this.registrationEventsPublisher.publishRegistrationStarted(savedRegistration, registrationTrace);

      if (savedRegistration.status === RegistrationStatus.CONFIRMED) {
        await this.registrationEventsPublisher.publishRegistrationConfirmed(savedRegistration, registrationTrace);
      }

      await this.auditService.trackRegistrationChange({
        tenantId: savedRegistration.tenantId,
        actorUserId: savedRegistration.userId,
        targetUserId: savedRegistration.userId,
        action: 'registration.created',
        before: null,
        after: { status: savedRegistration.status },
        metadata: {
          registrationId: savedRegistration.id,
          eventId: savedRegistration.eventId,
          ticketId: savedRegistration.ticketId,
          orderId: savedRegistration.orderId,
          traceId: registrationTrace.trace_id,
          spanId: registrationTrace.span_id,
          parentSpanId: registrationTrace.parent_span_id ?? null,
        },
      });

      return savedRegistration;
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof QueryFailedError && (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === '23505') {
        this.logger.warn(
          JSON.stringify({
            event: 'registration.register.idempotent_conflict',
            tenantId: input.tenantId,
            eventId: input.eventId,
            userId: input.userId,
            ticketId: input.ticketId,
          }),
        );
        throw new ConflictException('Registration already exists for this user and ticket.');
      }

      this.logger.error(
        JSON.stringify({
          event: 'registration.register.failed',
          tenantId: input.tenantId,
          eventId: input.eventId,
          userId: input.userId,
          ticketId: input.ticketId,
          error: error instanceof Error ? error.message : 'Unknown register error',
        }),
      );
      throw new InternalServerErrorException('Unable to register for event at this time.');
    }
  }

  private async assertRegistrationInput(
    input: RegisterForEventInput,
    repositories: {
      ticketRepository: Repository<TicketEntity>;
      orderRepository: Repository<OrderEntity>;
      orderItemRepository: Repository<OrderItemEntity>;
      registrationQuestionRepository: Repository<RegistrationQuestionEntity>;
    },
  ): Promise<void> {
    const ticket = await repositories.ticketRepository.findOne({
      where: {
        id: input.ticketId,
        tenantId: input.tenantId,
      },
    });

    if (!ticket || ticket.eventId !== input.eventId) {
      throw new BadRequestException('Ticket is invalid for the selected event.');
    }

    if (input.orderId || input.orderItemId || input.attendeeIndex !== undefined) {
      if (!input.orderId || !input.orderItemId || input.attendeeIndex === undefined) {
        throw new BadRequestException('orderId, orderItemId, and attendeeIndex must be provided together.');
      }

      const order = await repositories.orderRepository.findOne({
        where: {
          id: input.orderId,
          tenantId: input.tenantId,
        },
      });

      if (!order) {
        throw new BadRequestException('Order does not exist in the tenant context.');
      }

      const orderItem = await repositories.orderItemRepository.findOne({
        where: {
          id: input.orderItemId,
          tenantId: input.tenantId,
          orderId: input.orderId,
        },
      });

      if (!orderItem) {
        throw new BadRequestException('Order item does not exist in the tenant context.');
      }

      if (ticket.inventoryId !== orderItem.inventoryId) {
        throw new BadRequestException('Order item does not match the selected ticket inventory.');
      }

      const attendee = orderItem.attendees[input.attendeeIndex];
      if (!attendee || attendee.isTicketOwner !== true) {
        throw new BadRequestException('Registration attendee must be the designated ticket owner.');
      }
    }

    const requiredQuestions = await repositories.registrationQuestionRepository.find({
      where: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        isActive: true,
        isRequired: true,
      },
    });

    const providedAnswers = new Map(
      input.profile.answers.map((answer) => [answer.questionId, answer.value?.trim()]),
    );

    const missingRequiredQuestionIds = requiredQuestions
      .filter((question) => !providedAnswers.get(question.id))
      .map((question) => question.id);

    if (missingRequiredQuestionIds.length > 0) {
      throw new BadRequestException(
        `Missing required registration answers for question IDs: ${missingRequiredQuestionIds.join(', ')}.`,
      );
    }
  }

  async list(
    tenantId: string,
    filters: {
      eventId?: string;
      userId?: string;
      status?: RegistrationStatus;
    },
  ): Promise<RegistrationEntity[]> {
    return this.registrationRepository.find({
      where: {
        tenantId,
        eventId: filters.eventId,
        userId: filters.userId,
        status: filters.status,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(
    registrationId: string,
    tenantId: string,
    updates: UpdateRegistrationInput,
  ): Promise<RegistrationEntity | null> {
    const registration = await this.registrationRepository.findOne({
      where: {
        id: registrationId,
        tenantId,
      },
    });

    if (!registration) {
      return null;
    }

    if (updates.ticketId !== undefined) {
      registration.ticketId = updates.ticketId;
    }

    return this.registrationRepository.save(registration);
  }

  async approve(
    registrationId: string,
    tenantId: string,
    input: RegistrationApprovalInput,
  ): Promise<RegistrationEntity | null> {
    return this.registrationRepository.manager.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(RegistrationEntity);
      const eventSettingRepo = manager.getRepository(EventSettingEntity);

      const registration = await registrationRepo.findOne({
        where: {
          id: registrationId,
          tenantId,
        },
      });

      if (!registration || registration.status === RegistrationStatus.CANCELLED) {
        return registration;
      }

      const previousStatus = registration.status;

      if (previousStatus !== RegistrationStatus.PENDING && previousStatus !== RegistrationStatus.WAITLISTED) {
        return registration;
      }

      const eventSetting = await eventSettingRepo
        .createQueryBuilder('eventSetting')
        .setLock('pessimistic_write')
        .where('eventSetting.tenantId = :tenantId', { tenantId })
        .andWhere('eventSetting.eventId = :eventId', { eventId: registration.eventId })
        .getOne();

      const hasCapacity = await this.hasCapacityForConfirmation(registrationRepo, {
        tenantId,
        eventId: registration.eventId,
        capacity: eventSetting?.capacity ?? null,
      });

      registration.status = hasCapacity ? RegistrationStatus.CONFIRMED : RegistrationStatus.WAITLISTED;
      const saved = await registrationRepo.save(registration);

      const trace = buildDistributedTraceContext();

      if (saved.status === RegistrationStatus.CONFIRMED) {
        await this.registrationEventsPublisher.publishRegistrationConfirmed(saved, trace);
      }

      await this.auditService.trackRegistrationChange({
        tenantId: saved.tenantId,
        actorUserId: input.actorUserId,
        targetUserId: saved.userId,
        action: 'registration.approved',
        before: { status: previousStatus },
        after: { status: saved.status },
        metadata: {
          registrationId: saved.id,
          eventId: saved.eventId,
          ticketId: saved.ticketId,
          traceId: trace.trace_id,
          spanId: trace.span_id,
          parentSpanId: trace.parent_span_id ?? null,
        },
      });

      return saved;
    });
  }

  async cancel(registrationId: string, tenantId: string): Promise<RegistrationEntity | null> {
    return this.registrationRepository.manager.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(RegistrationEntity);

      const registration = await registrationRepo.findOne({
        where: {
          id: registrationId,
          tenantId,
        },
      });

      if (!registration || registration.status === RegistrationStatus.CANCELLED) {
        return registration;
      }

      const previousStatus = registration.status;
      const releasedConfirmedSlot = previousStatus === RegistrationStatus.CONFIRMED;
      registration.status = RegistrationStatus.CANCELLED;
      await registrationRepo.save(registration);

      const cancellationTrace = buildDistributedTraceContext();
      await this.registrationEventsPublisher.publishRegistrationCancelled(registration, cancellationTrace);

      await this.auditService.trackRegistrationChange({
        tenantId: registration.tenantId,
        actorUserId: registration.userId,
        targetUserId: registration.userId,
        action: 'registration.cancelled',
        before: { status: previousStatus },
        after: { status: registration.status },
        metadata: {
          registrationId: registration.id,
          eventId: registration.eventId,
          ticketId: registration.ticketId,
        },
      });

      if (releasedConfirmedSlot) {
        await this.promoteNextWaitlisted(registrationRepo, registration.tenantId, registration.eventId);
      }

      return registration;
    });
  }

  private async hasCapacityForConfirmation(
    repository: Repository<RegistrationEntity>,
    params: { tenantId: string; eventId: string; capacity: number | null },
  ): Promise<boolean> {
    if (params.capacity === null) {
      return true;
    }

    const confirmedCount = await repository.count({
      where: {
        tenantId: params.tenantId,
        eventId: params.eventId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    return confirmedCount < params.capacity;
  }

  private async promoteNextWaitlisted(
    repository: Repository<RegistrationEntity>,
    tenantId: string,
    eventId: string,
  ): Promise<void> {
    const nextWaitlisted = await repository.findOne({
      where: {
        tenantId,
        eventId,
        status: RegistrationStatus.WAITLISTED,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (!nextWaitlisted) {
      return;
    }

    nextWaitlisted.status = RegistrationStatus.CONFIRMED;
    const promotedRegistration = await repository.save(nextWaitlisted);
    await this.registrationEventsPublisher.publishRegistrationConfirmed(
      promotedRegistration,
      buildDistributedTraceContext(),
    );
    await this.auditService.trackRegistrationChange({
      tenantId: promotedRegistration.tenantId,
      actorUserId: null,
      targetUserId: promotedRegistration.userId,
      action: 'registration.promoted_from_waitlist',
      before: { status: RegistrationStatus.WAITLISTED },
      after: { status: promotedRegistration.status },
      metadata: {
        registrationId: promotedRegistration.id,
        eventId: promotedRegistration.eventId,
        ticketId: promotedRegistration.ticketId,
      },
    });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { OrderEntity } from '../../commerce/src/entities/order.entity';
import { EventSettingEntity } from '../../event/src/entities/event-setting.entity';
import { RegistrationQuestionEntity } from '../../event/src/entities/registration-question.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { CreateRegistrantProfileDto } from './dto/create-registration.dto';
import { RegistrantProfileEntity } from './entities/registrant-profile.entity';
import { RegistrationEntity, RegistrationStatus } from './entities/registration.entity';
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

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    @InjectRepository(EventSettingEntity)
    private readonly eventSettingRepository: Repository<EventSettingEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(RegistrantProfileEntity)
    private readonly registrantProfileRepository: Repository<RegistrantProfileEntity>,
    @InjectRepository(RegistrationQuestionEntity)
    private readonly registrationQuestionRepository: Repository<RegistrationQuestionEntity>,
    private readonly registrationEventsPublisher: RegistrationEventsPublisher,
    private readonly auditService: AuditService,
  ) {}

  async register(input: RegisterForEventInput): Promise<RegistrationEntity> {
    return this.registrationRepository.manager.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(RegistrationEntity);
      const eventSettingRepo = manager.getRepository(EventSettingEntity);
      const registrantProfileRepo = manager.getRepository(RegistrantProfileEntity);

      await this.assertRegistrationInput(input);

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

      const status = await this.resolveStatus(registrationRepo, {
        tenantId: input.tenantId,
        eventId: input.eventId,
        capacity: eventSetting?.capacity ?? null,
      });

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

      await this.registrationEventsPublisher.publishRegistrationCreated(savedRegistration);

      if (savedRegistration.status === RegistrationStatus.CONFIRMED) {
        await this.registrationEventsPublisher.publishRegistrationConfirmed(savedRegistration);
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
        },
      });

      return savedRegistration;
    });
  }

  private async assertRegistrationInput(input: RegisterForEventInput): Promise<void> {
    const ticket = await this.ticketRepository.findOne({
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

      const order = await this.orderRepository.findOne({
        where: {
          id: input.orderId,
          tenantId: input.tenantId,
        },
      });

      if (!order) {
        throw new BadRequestException('Order does not exist in the tenant context.');
      }

      const orderItem = await this.orderItemRepository.findOne({
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

    const requiredQuestions = await this.registrationQuestionRepository.find({
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

  private async resolveStatus(
    repository: Repository<RegistrationEntity>,
    params: { tenantId: string; eventId: string; capacity: number | null },
  ): Promise<RegistrationStatus> {
    if (params.capacity === null) {
      return RegistrationStatus.CONFIRMED;
    }

    const confirmedCount = await repository.count({
      where: {
        tenantId: params.tenantId,
        eventId: params.eventId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    return confirmedCount >= params.capacity
      ? RegistrationStatus.WAITLISTED
      : RegistrationStatus.CONFIRMED;
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
    await this.registrationEventsPublisher.publishRegistrationConfirmed(promotedRegistration);
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

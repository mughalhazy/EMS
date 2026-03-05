import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventSettingEntity } from '../../event/src/entities/event-setting.entity';
import { RegistrationEntity, RegistrationStatus } from './entities/registration.entity';

export interface RegisterForEventInput {
  tenantId: string;
  eventId: string;
  userId: string;
  ticketId: string;
}

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    @InjectRepository(EventSettingEntity)
    private readonly eventSettingRepository: Repository<EventSettingEntity>,
  ) {}

  async register(input: RegisterForEventInput): Promise<RegistrationEntity> {
    return this.registrationRepository.manager.transaction(async (manager) => {
      const registrationRepo = manager.getRepository(RegistrationEntity);
      const eventSettingRepo = manager.getRepository(EventSettingEntity);

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
      });

      return registrationRepo.save(registration);
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

      const releasedConfirmedSlot = registration.status === RegistrationStatus.CONFIRMED;
      registration.status = RegistrationStatus.CANCELLED;
      await registrationRepo.save(registration);

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
    await repository.save(nextWaitlisted);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegistrantProfileEntity } from '../../registration/src/entities/registrant-profile.entity';
import { RegistrationEntity, RegistrationStatus } from '../../registration/src/entities/registration.entity';
import { UserEntity } from '../../user/src/entities/user.entity';
import { AttendeeEntity, AttendeeStatus } from './entities/attendee.entity';

export interface ConfirmedRegistrationEventPayload {
  tenant_id: string;
  registration_id: string;
  event_id_ref: string;
  user_id: string;
}

@Injectable()
export class AttendeeService {
  private readonly logger = new Logger(AttendeeService.name);

  constructor(
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    @InjectRepository(RegistrantProfileEntity)
    private readonly registrantProfileRepository: Repository<RegistrantProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createFromConfirmedRegistration(
    payload: ConfirmedRegistrationEventPayload,
  ): Promise<AttendeeEntity | null> {
    const registration = await this.registrationRepository.findOne({
      where: {
        id: payload.registration_id,
        tenantId: payload.tenant_id,
      },
    });

    if (!registration || registration.status !== RegistrationStatus.CONFIRMED) {
      this.logger.warn(
        `Skipping attendee generation for registration '${payload.registration_id}' because it is missing or not confirmed.`,
      );
      return null;
    }

    const registrantProfile = await this.registrantProfileRepository.findOne({
      where: {
        registrationId: registration.id,
        tenantId: registration.tenantId,
      },
    });

    const user = await this.userRepository.findOne({
      where: {
        id: registration.userId,
        tenantId: registration.tenantId,
      },
    });

    const normalizedEmail = (registrantProfile?.contact.email ?? user?.email ?? '').trim().toLowerCase();

    if (!normalizedEmail) {
      this.logger.warn(
        `Skipping attendee generation for confirmed registration '${registration.id}' because no email is available.`,
      );
      return null;
    }

    const existingAttendee = await this.attendeeRepository.findOne({
      where: {
        tenantId: registration.tenantId,
        eventId: registration.eventId,
        email: normalizedEmail,
      },
    });

    if (existingAttendee) {
      if (!existingAttendee.userId && registration.userId) {
        existingAttendee.userId = registration.userId;
      }
      if (existingAttendee.status === AttendeeStatus.PROSPECT) {
        existingAttendee.status = AttendeeStatus.REGISTERED;
      }
      return this.attendeeRepository.save(existingAttendee);
    }

    const firstName = registrantProfile?.name.preferredName ?? registrantProfile?.name.firstName ?? user?.firstName ?? 'Guest';
    const lastName = registrantProfile?.name.lastName ?? user?.lastName ?? 'Attendee';

    const attendee = this.attendeeRepository.create({
      tenantId: registration.tenantId,
      eventId: registration.eventId,
      userId: registration.userId,
      firstName,
      lastName,
      email: normalizedEmail,
      phone: registrantProfile?.contact.phone ?? null,
      badgeName: registrantProfile?.name.preferredName ?? null,
      status: AttendeeStatus.REGISTERED,
    });

    return this.attendeeRepository.save(attendee);
  }
}

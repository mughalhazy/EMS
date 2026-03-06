import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { RegistrantProfileEntity } from '../../registration/src/entities/registrant-profile.entity';
import { RegistrationEntity, RegistrationStatus } from '../../registration/src/entities/registration.entity';
import { UserEntity } from '../../user/src/entities/user.entity';
import { AttendeeDirectorySearchIndexService } from './attendee-directory-search-index.service';
import { AttendeeProfileEntity } from './entities/attendee-profile.entity';
import { AttendeeEntity, AttendeeStatus } from './entities/attendee.entity';

export interface ConfirmedRegistrationEventPayload {
  tenant_id: string;
  registration_id: string;
  event_id_ref: string;
  user_id: string;
}

export type AttendeeDirectoryEntry = {
  attendeeId: string;
  tenantId: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  badgeName: string | null;
  bio: string | null;
  interests: string[];
};

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
    @InjectRepository(AttendeeProfileEntity)
    private readonly attendeeProfileRepository: Repository<AttendeeProfileEntity>,
    private readonly attendeeDirectorySearchIndexService: AttendeeDirectorySearchIndexService,
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
      const savedAttendee = await this.attendeeRepository.save(existingAttendee);
      await this.indexAttendee(savedAttendee);
      return savedAttendee;
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

    const savedAttendee = await this.attendeeRepository.save(attendee);
    await this.indexAttendee(savedAttendee);
    return savedAttendee;
  }

  async searchDirectory(
    tenantId: string,
    eventId: string,
    query: string,
    limit = 20,
  ): Promise<AttendeeDirectoryEntry[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    const sanitizedLimit = Math.max(1, Math.min(limit, 100));
    const attendeeIdsFromIndex = await this.attendeeDirectorySearchIndexService.searchAttendeeIds(
      tenantId,
      eventId,
      normalizedQuery,
      sanitizedLimit,
    );

    const attendees = attendeeIdsFromIndex
      ? await this.findAttendeesByIds(tenantId, eventId, attendeeIdsFromIndex)
      : await this.searchAttendeesFromDatabase(tenantId, eventId, normalizedQuery, sanitizedLimit);

    const attendeeProfilesByUserId = await this.loadProfilesByUserId(
      tenantId,
      eventId,
      attendees.map((attendee) => attendee.userId).filter((userId): userId is string => Boolean(userId)),
    );

    return attendees.map((attendee) => {
      const attendeeProfile = attendee.userId ? attendeeProfilesByUserId.get(attendee.userId) : undefined;

      return {
        attendeeId: attendee.id,
        tenantId: attendee.tenantId,
        eventId: attendee.eventId,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        phone: attendee.phone,
        badgeName: attendee.badgeName,
        bio: attendeeProfile?.bio ?? null,
        interests: attendeeProfile?.interests ?? [],
      };
    });
  }

  private async indexAttendee(attendee: AttendeeEntity): Promise<void> {
    const attendeeProfile = attendee.userId
      ? await this.attendeeProfileRepository.findOne({
          where: { tenantId: attendee.tenantId, eventId: attendee.eventId, userId: attendee.userId },
        })
      : null;

    await this.attendeeDirectorySearchIndexService.upsertAttendee(attendee, attendeeProfile);
  }

  private async findAttendeesByIds(
    tenantId: string,
    eventId: string,
    attendeeIds: string[],
  ): Promise<AttendeeEntity[]> {
    const attendees = await this.attendeeRepository.find({
      where: attendeeIds.map((attendeeId) => ({ id: attendeeId, tenantId, eventId })),
    });

    const attendeesById = new Map(attendees.map((attendee) => [attendee.id, attendee]));

    return attendeeIds
      .map((attendeeId) => attendeesById.get(attendeeId))
      .filter((attendee): attendee is AttendeeEntity => Boolean(attendee));
  }

  private async searchAttendeesFromDatabase(
    tenantId: string,
    eventId: string,
    query: string,
    limit: number,
  ): Promise<AttendeeEntity[]> {
    const likeQuery = `%${query.toLowerCase()}%`;

    return this.attendeeRepository
      .createQueryBuilder('attendee')
      .leftJoin(
        AttendeeProfileEntity,
        'profile',
        'profile.tenant_id = attendee.tenant_id AND profile.event_id = attendee.event_id AND profile.user_id = attendee.user_id',
      )
      .where('attendee.tenant_id = :tenantId', { tenantId })
      .andWhere('attendee.event_id = :eventId', { eventId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(attendee.first_name) LIKE :query', { query: likeQuery })
            .orWhere('LOWER(attendee.last_name) LIKE :query', { query: likeQuery })
            .orWhere('LOWER(attendee.badge_name) LIKE :query', { query: likeQuery })
            .orWhere('LOWER(attendee.email) LIKE :query', { query: likeQuery })
            .orWhere('LOWER(attendee.phone) LIKE :query', { query: likeQuery })
            .orWhere("LOWER(COALESCE(profile.bio, '')) LIKE :query", { query: likeQuery })
            .orWhere("LOWER(array_to_string(COALESCE(profile.interests, ARRAY[]::text[]), ' ')) LIKE :query", {
              query: likeQuery,
            });
        }),
      )
      .orderBy('attendee.last_name', 'ASC')
      .addOrderBy('attendee.first_name', 'ASC')
      .limit(limit)
      .getMany();
  }

  private async loadProfilesByUserId(
    tenantId: string,
    eventId: string,
    userIds: string[],
  ): Promise<Map<string, AttendeeProfileEntity>> {
    if (!userIds.length) {
      return new Map();
    }

    const profiles = await this.attendeeProfileRepository.find({
      where: userIds.map((userId) => ({ tenantId, eventId, userId })),
    });

    return new Map(profiles.map((profile) => [profile.userId, profile]));
  }
}

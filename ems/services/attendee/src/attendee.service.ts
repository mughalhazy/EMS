import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { AttendeeScheduleEntity } from '../../agenda/src/entities/attendee-schedule.entity';
import { SessionEntity } from '../../agenda/src/entities/session.entity';
import {
  AttendeeConnectionEntity,
  AttendeeConnectionStatus,
} from '../../networking/src/entities/attendee-connection.entity';
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

export type AttendeePortalProfile = {
  attendeeId: string;
  tenantId: string;
  eventId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  badgeName: string | null;
  bio: string | null;
  interests: string[];
  status: AttendeeStatus;
};

export type AttendeeConnectionView = {
  connectionId: string;
  status: AttendeeConnectionStatus;
  attendee: {
    attendeeId: string;
    firstName: string;
    lastName: string;
    badgeName: string | null;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type AttendeeScheduleItem = {
  scheduleId: string;
  sessionId: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  roomId: string;
  status: SessionEntity['status'];
  agendaOrder: number;
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
    @InjectRepository(AttendeeConnectionEntity)
    private readonly attendeeConnectionRepository: Repository<AttendeeConnectionEntity>,
    @InjectRepository(AttendeeScheduleEntity)
    private readonly attendeeScheduleRepository: Repository<AttendeeScheduleEntity>,
    private readonly attendeeDirectorySearchIndexService: AttendeeDirectorySearchIndexService,
  ) {}

  async getPortalProfile(tenantId: string, eventId: string, attendeeId: string): Promise<AttendeePortalProfile> {
    const attendee = await this.getAttendeeInEventOrThrow(tenantId, eventId, attendeeId);

    const attendeeProfile = attendee.userId
      ? await this.attendeeProfileRepository.findOne({
          where: { tenantId, eventId, userId: attendee.userId },
        })
      : null;

    return {
      attendeeId: attendee.id,
      tenantId: attendee.tenantId,
      eventId: attendee.eventId,
      userId: attendee.userId,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      phone: attendee.phone,
      badgeName: attendee.badgeName,
      bio: attendeeProfile?.bio ?? null,
      interests: attendeeProfile?.interests ?? [],
      status: attendee.status,
    };
  }

  async listPortalConnections(tenantId: string, eventId: string, attendeeId: string): Promise<AttendeeConnectionView[]> {
    await this.getAttendeeInEventOrThrow(tenantId, eventId, attendeeId);

    const connections = await this.attendeeConnectionRepository
      .createQueryBuilder('connection')
      .where('connection.tenant_id = :tenantId', { tenantId })
      .andWhere('connection.event_id = :eventId', { eventId })
      .andWhere('(connection.attendee_a_id = :attendeeId OR connection.attendee_b_id = :attendeeId)', { attendeeId })
      .orderBy('connection.updated_at', 'DESC')
      .getMany();

    if (!connections.length) {
      return [];
    }

    const connectedAttendeeIds = Array.from(
      new Set(
        connections.map((connection) =>
          connection.attendeeAId === attendeeId ? connection.attendeeBId : connection.attendeeAId,
        ),
      ),
    );

    const connectedAttendees = await this.attendeeRepository.find({
      where: connectedAttendeeIds.map((connectedAttendeeId) => ({
        id: connectedAttendeeId,
        tenantId,
        eventId,
      })),
    });

    const connectedAttendeesById = new Map(
      connectedAttendees.map((connectedAttendee) => [connectedAttendee.id, connectedAttendee]),
    );

    return connections
      .map((connection) => {
        const connectedAttendeeId =
          connection.attendeeAId === attendeeId ? connection.attendeeBId : connection.attendeeAId;
        const connectedAttendee = connectedAttendeesById.get(connectedAttendeeId);
        if (!connectedAttendee) {
          return null;
        }

        return {
          connectionId: connection.id,
          status: connection.status,
          attendee: {
            attendeeId: connectedAttendee.id,
            firstName: connectedAttendee.firstName,
            lastName: connectedAttendee.lastName,
            badgeName: connectedAttendee.badgeName,
            email: connectedAttendee.email,
          },
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
        };
      })
      .filter((connection): connection is AttendeeConnectionView => Boolean(connection));
  }

  async listPortalSchedule(tenantId: string, eventId: string, attendeeId: string): Promise<AttendeeScheduleItem[]> {
    await this.getAttendeeInEventOrThrow(tenantId, eventId, attendeeId);

    const schedules = await this.attendeeScheduleRepository.find({
      where: { tenantId, eventId, attendeeId },
      relations: { session: true },
      order: { session: { startTime: 'ASC' } },
    });

    return schedules.map((schedule) => ({
      scheduleId: schedule.id,
      sessionId: schedule.sessionId,
      title: schedule.session.title,
      description: schedule.session.description,
      startTime: schedule.session.startTime,
      endTime: schedule.session.endTime,
      roomId: schedule.session.roomId,
      status: schedule.session.status,
      agendaOrder: schedule.session.agendaOrder,
    }));
  }

  async createFromConfirmedRegistration(
    payload: ConfirmedRegistrationEventPayload,
  ): Promise<AttendeeEntity | null> {
    const registration = await this.registrationRepository.findOne({
      where: {
        id: payload.registration_id,
        tenantId: payload.tenant_id,
      },
    });

    if (registration && registration.eventId !== payload.event_id_ref) {
      this.logger.warn(
        `Skipping attendee generation for registration '${payload.registration_id}' because payload event '${payload.event_id_ref}' does not match registration event '${registration.eventId}'.`,
      );
      return null;
    }

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
      await this.upsertAttendeeProfileForUser(savedAttendee.tenantId, savedAttendee.eventId, savedAttendee.userId);
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
    await this.upsertAttendeeProfileForUser(savedAttendee.tenantId, savedAttendee.eventId, savedAttendee.userId);
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

  private async upsertAttendeeProfileForUser(
    tenantId: string,
    eventId: string,
    userId: string | null,
  ): Promise<void> {
    if (!userId) {
      return;
    }

    const existingProfile = await this.attendeeProfileRepository.findOne({
      where: { tenantId, eventId, userId },
    });

    if (existingProfile) {
      return;
    }

    await this.attendeeProfileRepository.save(
      this.attendeeProfileRepository.create({
        tenantId,
        eventId,
        userId,
        bio: null,
        interests: [],
      }),
    );
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

  private async getAttendeeInEventOrThrow(
    tenantId: string,
    eventId: string,
    attendeeId: string,
  ): Promise<AttendeeEntity> {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: attendeeId, tenantId, eventId },
    });

    if (!attendee) {
      throw new NotFoundException('Attendee not found in tenant event.');
    }

    return attendee;
  }
}

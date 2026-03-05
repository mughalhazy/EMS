import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { RoomEntity } from './entities/room.entity';
import { SessionEntity, SessionStatus } from './entities/session.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SessionLifecyclePublisher } from './session-lifecycle.publisher';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    @InjectRepository(SessionSpeakerEntity)
    private readonly sessionSpeakerRepository: Repository<SessionSpeakerEntity>,
    private readonly sessionLifecyclePublisher: SessionLifecyclePublisher,
  ) {}

  async create(input: DeepPartial<SessionEntity>): Promise<SessionEntity> {
    const startAt = this.toDate(input.startAt, 'startAt');
    const endAt = this.toDate(input.endAt, 'endAt');

    this.ensureValidTimeWindow(startAt, endAt);

    await this.ensureRoomExistsForEvent(input);
    await this.ensureNoRoomTimeConflict({
      tenantId: input.tenantId,
      eventId: input.eventId,
      roomId: input.roomId,
      startAt,
      endAt,
      status: input.status ?? SessionStatus.DRAFT,
    });

    const session = this.sessionRepository.create({
      ...input,
      startAt,
      endAt,
    });

    const savedSession = await this.sessionRepository.save(session);
    await this.sessionLifecyclePublisher.publish('session.created', savedSession, {
      eventId: savedSession.eventId,
      roomId: savedSession.roomId,
      title: savedSession.title,
      status: savedSession.status,
      startAt: savedSession.startAt.toISOString(),
      endAt: savedSession.endAt.toISOString(),
    });

    return savedSession;
  }

  async findByTenantEvent(tenantId: string, eventId: string): Promise<SessionEntity[]> {
    return this.sessionRepository.find({
      where: { tenantId, eventId },
      relations: { room: true, sessionSpeakers: true },
      order: { startAt: 'ASC', createdAt: 'ASC' },
    });
  }

  async findByTenantEventAndId(
    tenantId: string,
    eventId: string,
    sessionId: string,
  ): Promise<SessionEntity | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId, tenantId, eventId },
      relations: { room: true, sessionSpeakers: true },
    });
  }

  async update(
    tenantId: string,
    eventId: string,
    sessionId: string,
    input: DeepPartial<SessionEntity>,
  ): Promise<SessionEntity | null> {
    const session = await this.findByTenantEventAndId(tenantId, eventId, sessionId);
    if (!session) {
      return null;
    }

    const nextStartAt = input.startAt
      ? this.toDate(input.startAt, 'startAt')
      : session.startAt;
    const nextEndAt = input.endAt ? this.toDate(input.endAt, 'endAt') : session.endAt;
    const nextRoomId = input.roomId === undefined ? session.roomId : input.roomId;
    const nextStatus = input.status ?? session.status;

    this.ensureValidTimeWindow(nextStartAt, nextEndAt);

    await this.ensureRoomExistsForEvent({
      tenantId,
      eventId,
      roomId: nextRoomId,
    });

    await this.ensureNoRoomTimeConflict({
      tenantId,
      eventId,
      roomId: nextRoomId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      status: nextStatus,
      excludingSessionId: sessionId,
    });

    await this.ensureNoSpeakerTimeConflict({
      tenantId,
      eventId,
      sessionId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      status: nextStatus,
    });

    Object.assign(session, {
      ...input,
      roomId: nextRoomId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      status: nextStatus,
    });

    const updatedSession = await this.sessionRepository.save(session);
    await this.sessionLifecyclePublisher.publish('session.updated', updatedSession, {
      eventId: updatedSession.eventId,
      roomId: updatedSession.roomId,
      title: updatedSession.title,
      status: updatedSession.status,
      updatedFields: Object.keys(input),
      startAt: updatedSession.startAt.toISOString(),
      endAt: updatedSession.endAt.toISOString(),
    });

    return updatedSession;
  }

  async remove(tenantId: string, eventId: string, sessionId: string): Promise<boolean> {
    const result = await this.sessionRepository.delete({ id: sessionId, tenantId, eventId });
    return (result.affected ?? 0) > 0;
  }

  private async ensureNoRoomTimeConflict(input: {
    tenantId?: string;
    eventId?: string;
    roomId?: string | null;
    startAt: Date;
    endAt: Date;
    status: SessionStatus;
    excludingSessionId?: string;
  }): Promise<void> {
    if (!input.tenantId || !input.eventId || !input.roomId) {
      return;
    }

    if (input.status !== SessionStatus.SCHEDULED) {
      return;
    }

    const conflictingSession = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.tenantId = :tenantId', { tenantId: input.tenantId })
      .andWhere('session.eventId = :eventId', { eventId: input.eventId })
      .andWhere('session.roomId = :roomId', { roomId: input.roomId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.startAt < :endAt', { endAt: input.endAt.toISOString() })
      .andWhere('session.endAt > :startAt', { startAt: input.startAt.toISOString() })
      .andWhere(
        input.excludingSessionId ? 'session.id != :excludingSessionId' : '1=1',
        { excludingSessionId: input.excludingSessionId },
      )
      .getOne();

    if (conflictingSession) {
      throw new ConflictException(
        `Room is already booked for session '${conflictingSession.title}' during this time window.`,
      );
    }
  }

  private async ensureNoSpeakerTimeConflict(input: {
    tenantId: string;
    eventId: string;
    sessionId: string;
    startAt: Date;
    endAt: Date;
    status: SessionStatus;
  }): Promise<void> {
    if (input.status !== SessionStatus.SCHEDULED) {
      return;
    }

    const conflict = await this.sessionSpeakerRepository
      .createQueryBuilder('targetAssignment')
      .innerJoin('targetAssignment.speaker', 'speaker')
      .innerJoin('session_speakers', 'otherAssignment', 'otherAssignment.speaker_id = speaker.id')
      .innerJoin(
        'sessions',
        'otherSession',
        'otherSession.id = otherAssignment.session_id AND otherSession.id != :sessionId',
        { sessionId: input.sessionId },
      )
      .where('targetAssignment.tenantId = :tenantId', { tenantId: input.tenantId })
      .andWhere('targetAssignment.sessionId = :sessionId', { sessionId: input.sessionId })
      .andWhere('speaker.tenantId = :tenantId', { tenantId: input.tenantId })
      .andWhere('speaker.eventId = :eventId', { eventId: input.eventId })
      .andWhere('otherSession.tenant_id = :tenantId', { tenantId: input.tenantId })
      .andWhere('otherSession.event_id = :eventId', { eventId: input.eventId })
      .andWhere('otherSession.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('otherSession.start_at < :endAt', { endAt: input.endAt.toISOString() })
      .andWhere('otherSession.end_at > :startAt', { startAt: input.startAt.toISOString() })
      .select(['speaker.id AS "speakerId"', 'speaker.first_name AS "speakerFirstName"', 'speaker.last_name AS "speakerLastName"', 'otherSession.title AS "sessionTitle"'])
      .getRawOne<{
        speakerId: string;
        speakerFirstName: string;
        speakerLastName: string;
        sessionTitle: string;
      }>();

    if (conflict) {
      throw new ConflictException(
        `Speaker '${conflict.speakerFirstName} ${conflict.speakerLastName}' has a scheduling conflict with session '${conflict.sessionTitle}'.`,
      );
    }
  }

  private async ensureRoomExistsForEvent(input: {
    tenantId?: string;
    eventId?: string;
    roomId?: string | null;
  }): Promise<void> {
    if (!input.roomId) {
      return;
    }

    const room = await this.roomRepository.findOne({
      where: {
        id: input.roomId,
        tenantId: input.tenantId,
        eventId: input.eventId,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found in event.');
    }
  }

  private ensureValidTimeWindow(startAt: Date, endAt: Date): void {
    if (startAt >= endAt) {
      throw new BadRequestException('Session end time must be later than start time.');
    }
  }

  private toDate(value: string | Date | undefined, fieldName: string): Date {
    if (!value) {
      throw new BadRequestException(`'${fieldName}' is required for scheduling.`);
    }

    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      throw new BadRequestException(`'${fieldName}' must be a valid date.`);
    }

    return dateValue;
  }
}

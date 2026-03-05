import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { RoomEntity } from './entities/room.entity';
import { SessionEntity, SessionStatus } from './entities/session.entity';
import { EventLifecyclePublisher } from './event-lifecycle.publisher';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly eventLifecyclePublisher: EventLifecyclePublisher,
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

    await this.eventLifecyclePublisher.publish('session.created', savedSession, {
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

    Object.assign(session, {
      ...input,
      roomId: nextRoomId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      status: nextStatus,
    });

    const updatedSession = await this.sessionRepository.save(session);

    await this.eventLifecyclePublisher.publish('session.updated', updatedSession, {
      eventId: updatedSession.eventId,
      roomId: updatedSession.roomId,
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

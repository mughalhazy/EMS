import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { SpeakerEntity } from '../../speaker/src/entities/speaker.entity';
import { RoomEntity } from '../../event/src/entities/room.entity';
import { SessionEntity, SessionStatus } from './entities/session.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SessionLifecyclePublisher } from './session-lifecycle.publisher';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SessionSpeakerEntity)
    private readonly sessionSpeakerRepository: Repository<SessionSpeakerEntity>,
    @InjectRepository(SpeakerEntity)
    private readonly speakerRepository: Repository<SpeakerEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private readonly sessionLifecyclePublisher: SessionLifecyclePublisher,
    private readonly auditService: AuditService,
  ) {}

  async create(input: Partial<SessionEntity>, actorUserId?: string): Promise<SessionEntity> {
    this.ensureValidTimes(input.startTime, input.endTime);
    await this.ensureRoomExists(input.tenantId!, input.eventId!, input.roomId!);
    await this.ensureNoRoomConflict(input.tenantId!, input.eventId!, input.roomId!, input.startTime!, input.endTime!);

    const session = this.sessionRepository.create({
      ...input,
      remainingSeats: input.capacity,
      status: input.status ?? SessionStatus.DRAFT,
    });
    const saved = await this.sessionRepository.save(session);
    await this.sessionLifecyclePublisher.publish('session.created', saved);
    await this.auditService.trackEventChange({
      tenantId: saved.tenantId,
      actorUserId,
      action: 'agenda.session.created',
      after: this.auditSession(saved),
    });
    return saved;
  }

  async list(tenantId: string, eventId: string): Promise<SessionEntity[]> {
    return this.sessionRepository.find({ where: { tenantId, eventId }, order: { agendaOrder: 'ASC', startTime: 'ASC' } });
  }

  async update(tenantId: string, eventId: string, sessionId: string, input: Partial<SessionEntity>, actorUserId?: string): Promise<SessionEntity | null> {
    const existing = await this.sessionRepository.findOne({ where: { id: sessionId, tenantId, eventId } });
    if (!existing) return null;

    const nextStart = input.startTime ?? existing.startTime;
    const nextEnd = input.endTime ?? existing.endTime;
    const nextRoomId = input.roomId ?? existing.roomId;

    this.ensureValidTimes(nextStart, nextEnd);
    await this.ensureRoomExists(tenantId, eventId, nextRoomId);
    await this.ensureNoRoomConflict(tenantId, eventId, nextRoomId, nextStart, nextEnd, sessionId);

    Object.assign(existing, input);
    if (input.capacity !== undefined) {
      const allocated = existing.capacity - existing.remainingSeats;
      if (input.capacity < allocated) {
        throw new BadRequestException('Capacity cannot be lower than currently allocated seats.');
      }
      existing.remainingSeats = input.capacity - allocated;
    }

    const updated = await this.sessionRepository.save(existing);
    await this.sessionLifecyclePublisher.publish('session.updated', updated);
    await this.auditService.trackEventChange({
      tenantId,
      actorUserId,
      action: 'agenda.session.updated',
      before: this.auditSession(existing),
      after: this.auditSession(updated),
    });
    return updated;
  }

  async assignSpeaker(input: { tenantId: string; eventId: string; sessionId: string; speakerId: string }, actorUserId?: string): Promise<SessionSpeakerEntity> {
    const session = await this.sessionRepository.findOne({ where: { id: input.sessionId, tenantId: input.tenantId, eventId: input.eventId } });
    if (!session) throw new NotFoundException('Session not found in tenant event.');
    const speaker = await this.speakerRepository.findOne({ where: { id: input.speakerId, tenantId: input.tenantId, eventId: input.eventId } });
    if (!speaker) throw new BadRequestException('Invalid speaker assignment for tenant/event scope.');

    const duplicate = await this.sessionSpeakerRepository.findOne({ where: input });
    if (duplicate) return duplicate;

    await this.ensureNoSpeakerConflict(input.tenantId, input.eventId, input.sessionId, input.speakerId, session.startTime, session.endTime);
    const assignment = await this.sessionSpeakerRepository.save(this.sessionSpeakerRepository.create(input));
    await this.auditService.trackEventChange({
      tenantId: input.tenantId,
      actorUserId,
      action: 'agenda.session.speaker.assigned',
      after: { sessionId: input.sessionId, speakerId: input.speakerId },
    });
    return assignment;
  }

  private async ensureNoRoomConflict(tenantId: string, eventId: string, roomId: string, startTime: Date, endTime: Date, excludingSessionId?: string): Promise<void> {
    const qb = this.sessionRepository.createQueryBuilder('session')
      .where('session.tenant_id = :tenantId', { tenantId })
      .andWhere('session.event_id = :eventId', { eventId })
      .andWhere('session.room_id = :roomId', { roomId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.start_time < :endTime', { endTime: endTime.toISOString() })
      .andWhere('session.end_time > :startTime', { startTime: startTime.toISOString() });

    if (excludingSessionId) qb.andWhere('session.id != :excludingSessionId', { excludingSessionId });

    const conflict = await qb.getOne();
    if (conflict) throw new ConflictException('Scheduling conflict: room already booked for the specified time window.');
  }

  private async ensureNoSpeakerConflict(tenantId: string, eventId: string, sessionId: string, speakerId: string, startTime: Date, endTime: Date): Promise<void> {
    const conflict = await this.sessionSpeakerRepository.createQueryBuilder('ss')
      .innerJoin('ss.session', 'session')
      .where('ss.tenant_id = :tenantId', { tenantId })
      .andWhere('ss.event_id = :eventId', { eventId })
      .andWhere('ss.speaker_id = :speakerId', { speakerId })
      .andWhere('ss.session_id != :sessionId', { sessionId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.start_time < :endTime', { endTime: endTime.toISOString() })
      .andWhere('session.end_time > :startTime', { startTime: startTime.toISOString() })
      .getOne();

    if (conflict) throw new ConflictException('Speaker has an overlapping scheduled session.');
  }

  private async ensureRoomExists(tenantId: string, eventId: string, roomId: string): Promise<void> {
    const room = await this.roomRepository.findOne({ where: { id: roomId, tenantId, eventId } });
    if (!room) throw new BadRequestException('Room not found in tenant event.');
  }

  private ensureValidTimes(startTime?: Date, endTime?: Date): void {
    if (!startTime || !endTime || startTime >= endTime) {
      throw new BadRequestException('Invalid session schedule.');
    }
  }

  private auditSession(session: SessionEntity): Record<string, unknown> {
    return {
      id: session.id,
      eventId: session.eventId,
      roomId: session.roomId,
      startTime: session.startTime,
      endTime: session.endTime,
      capacity: session.capacity,
      remainingSeats: session.remainingSeats,
      agendaOrder: session.agendaOrder,
      status: session.status,
    };
  }
}

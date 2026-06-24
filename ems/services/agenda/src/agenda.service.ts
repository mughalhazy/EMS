import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { Track } from './entities/track.entity';
import { Session } from './entities/session.entity';
import { CreateTrackDto, UpdateTrackDto } from './dto/create-track.dto';
import { CreateSessionDto, UpdateSessionDto } from './dto/create-session.dto';

@Injectable()
export class AgendaService implements OnModuleInit {
  constructor(
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      'agenda-service',
      ['event.created', 'event.cancelled'],
      async (event) => {
        const { eventType, payload } = event as unknown as {
          eventType: string;
          payload: { eventId: string };
        };
        if (eventType === 'event.cancelled') {
          await this.sessions.update({ eventId: payload.eventId }, { status: 'cancelled' });
        }
      },
    );
  }

  // Tracks
  async createTrack(dto: CreateTrackDto) {
    const track = this.tracks.create(dto);
    return this.tracks.save(track);
  }

  async listTracks(eventId: string) {
    return this.tracks.find({ where: { eventId }, order: { createdAt: 'ASC' } });
  }

  async findTrack(id: string) {
    const track = await this.tracks.findOne({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  async updateTrack(id: string, dto: UpdateTrackDto) {
    const track = await this.findTrack(id);
    Object.assign(track, dto);
    return this.tracks.save(track);
  }

  async deleteTrack(id: string) {
    const track = await this.findTrack(id);
    await this.tracks.remove(track);
  }

  // Sessions
  async createSession(dto: CreateSessionDto, tenantId: string) {
    if (dto.roomId)
      await this.checkRoomConflict(dto.eventId, dto.roomId, dto.startTime, dto.endTime);
    const session = this.sessions.create({
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });
    await this.sessions.save(session);
    await this.eventBus.publish('session.created', {
      eventType: 'session.created',
      tenantId,
      payload: {
        sessionId: session.id,
        eventId: session.eventId,
        trackId: session.trackId,
        roomId: session.roomId,
      },
    });
    return session;
  }

  async listSessions(eventId: string, trackId?: string) {
    const where: Partial<Session> = { eventId };
    if (trackId) where.trackId = trackId;
    return this.sessions.find({ where, order: { startTime: 'ASC' } });
  }

  async findSession(id: string) {
    const session = await this.sessions.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async updateSession(id: string, dto: UpdateSessionDto, tenantId: string) {
    const session = await this.findSession(id);
    const startTime = dto.startTime ? new Date(dto.startTime) : session.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : session.endTime;
    const roomId = dto.roomId !== undefined ? dto.roomId : session.roomId;
    if (roomId)
      await this.checkRoomConflict(
        session.eventId,
        roomId,
        startTime.toISOString(),
        endTime.toISOString(),
        id,
      );
    Object.assign(session, { ...dto, startTime, endTime });
    await this.sessions.save(session);
    await this.eventBus.publish('session.updated', {
      eventType: 'session.updated',
      tenantId,
      payload: { sessionId: id },
    });
    return session;
  }

  async deleteSession(id: string, tenantId: string) {
    const session = await this.findSession(id);
    session.status = 'cancelled';
    await this.sessions.save(session);
    await this.eventBus.publish('session.cancelled', {
      eventType: 'session.cancelled',
      tenantId,
      payload: { sessionId: id },
    });
  }

  private async checkRoomConflict(
    eventId: string,
    roomId: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const qb = this.sessions
      .createQueryBuilder('s')
      .where('s.eventId = :eventId', { eventId })
      .andWhere('s.roomId = :roomId', { roomId })
      .andWhere('s.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('NOT (s.endTime <= :startTime OR s.startTime >= :endTime)', { startTime, endTime });
    if (excludeId) qb.andWhere('s.id != :excludeId', { excludeId });
    const conflict = await qb.getOne();
    if (conflict) throw new ConflictException('Room is already booked for this time slot');
  }
}

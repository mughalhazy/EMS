import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionStatus, SessionEntity } from './entities/session.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SpeakerEntity } from './entities/speaker.entity';

@Injectable()
export class SpeakerAssignmentService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SpeakerEntity)
    private readonly speakerRepository: Repository<SpeakerEntity>,
    @InjectRepository(SessionSpeakerEntity)
    private readonly sessionSpeakerRepository: Repository<SessionSpeakerEntity>,
  ) {}

  async findSession(
    tenantId: string,
    eventId: string,
    sessionId: string,
  ): Promise<SessionEntity | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId, tenantId, eventId },
    });
  }

  async findSpeaker(
    tenantId: string,
    eventId: string,
    speakerId: string,
  ): Promise<SpeakerEntity | null> {
    return this.speakerRepository.findOne({
      where: { id: speakerId, tenantId, eventId },
    });
  }

  async listSpeakersForSession(
    tenantId: string,
    eventId: string,
    sessionId: string,
  ): Promise<SessionSpeakerEntity[]> {
    return this.sessionSpeakerRepository.find({
      where: { tenantId, eventId, sessionId },
      relations: { speaker: true, session: true },
      order: { createdAt: 'ASC' },
    });
  }

  async listSessionsForSpeaker(
    tenantId: string,
    eventId: string,
    speakerId: string,
  ): Promise<SessionSpeakerEntity[]> {
    return this.sessionSpeakerRepository.find({
      where: { tenantId, eventId, speakerId },
      relations: { speaker: true, session: true },
      order: { createdAt: 'ASC' },
    });
  }

  async assignSpeakerToSession(input: {
    tenantId: string;
    eventId: string;
    sessionId: string;
    speakerId: string;
  }): Promise<SessionSpeakerEntity> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: input.sessionId,
        tenantId: input.tenantId,
        eventId: input.eventId,
      },
    });

    if (session?.status === SessionStatus.SCHEDULED) {
      await this.ensureNoSpeakerTimeConflict({
        tenantId: input.tenantId,
        eventId: input.eventId,
        sessionId: input.sessionId,
        speakerId: input.speakerId,
        startAt: session.startAt,
        endAt: session.endAt,
      });
    }

    const existing = await this.sessionSpeakerRepository.findOne({
      where: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        sessionId: input.sessionId,
        speakerId: input.speakerId,
      },
      relations: { speaker: true, session: true },
    });

    if (existing) {
      return existing;
    }

    const assignment = this.sessionSpeakerRepository.create(input);
    await this.sessionSpeakerRepository.save(assignment);

    return this.sessionSpeakerRepository.findOneOrFail({
      where: { id: assignment.id },
      relations: { speaker: true, session: true },
    });
  }

  async unassignSpeakerFromSession(
    tenantId: string,
    eventId: string,
    sessionId: string,
    speakerId: string,
  ): Promise<boolean> {
    const result = await this.sessionSpeakerRepository.delete({
      tenantId,
      eventId,
      sessionId,
      speakerId,
    });

    return (result.affected ?? 0) > 0;
  }

  private async ensureNoSpeakerTimeConflict(input: {
    tenantId: string;
    eventId: string;
    sessionId: string;
    speakerId: string;
    startAt: Date;
    endAt: Date;
  }): Promise<void> {
    const conflictingAssignment = await this.sessionSpeakerRepository
      .createQueryBuilder('sessionSpeaker')
      .innerJoinAndSelect('sessionSpeaker.session', 'session')
      .where('sessionSpeaker.tenantId = :tenantId', { tenantId: input.tenantId })
      .andWhere('sessionSpeaker.eventId = :eventId', { eventId: input.eventId })
      .andWhere('sessionSpeaker.speakerId = :speakerId', { speakerId: input.speakerId })
      .andWhere('sessionSpeaker.sessionId != :sessionId', { sessionId: input.sessionId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.startAt < :endAt', { endAt: input.endAt.toISOString() })
      .andWhere('session.endAt > :startAt', { startAt: input.startAt.toISOString() })
      .getOne();

    if (conflictingAssignment) {
      throw new ConflictException(
        `Speaker already assigned to overlapping session '${conflictingAssignment.session.title}'.`,
      );
    }
  }
}

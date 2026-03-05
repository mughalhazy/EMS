import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionEntity } from './entities/session.entity';
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
}

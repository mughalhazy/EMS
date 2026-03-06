import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { SpeakerEntity } from './entities/speaker.entity';

@Injectable()
export class SpeakerService {
  constructor(
    @InjectRepository(SpeakerEntity)
    private readonly speakerRepository: Repository<SpeakerEntity>,
    private readonly auditService: AuditService,
  ) {}

  async create(input: Partial<SpeakerEntity>, actorUserId?: string): Promise<SpeakerEntity> {
    if (input.email) {
      const existing = await this.findByTenantEventAndEmail(input.tenantId!, input.eventId!, input.email);
      if (existing) throw new ConflictException('Speaker email already exists in event.');
    }
    const speaker = await this.speakerRepository.save(this.speakerRepository.create(input));
    await this.auditService.trackEventChange({ tenantId: speaker.tenantId, actorUserId, action: 'speaker.created', after: this.auditSpeaker(speaker) });
    return speaker;
  }

  async list(tenantId: string, eventId: string): Promise<SpeakerEntity[]> {
    return this.speakerRepository.find({ where: { tenantId, eventId }, order: { createdAt: 'DESC' } });
  }

  async update(tenantId: string, eventId: string, speakerId: string, input: Partial<SpeakerEntity>, actorUserId?: string): Promise<SpeakerEntity | null> {
    const speaker = await this.speakerRepository.findOne({ where: { id: speakerId, tenantId, eventId } });
    if (!speaker) return null;
    if (input.email && input.email !== speaker.email) {
      const existing = await this.findByTenantEventAndEmail(tenantId, eventId, input.email);
      if (existing && existing.id !== speakerId) {
        throw new ConflictException('Speaker email already exists in event.');
      }
    }

    const before = this.auditSpeaker(speaker);
    Object.assign(speaker, input);
    const updated = await this.speakerRepository.save(speaker);
    await this.auditService.trackEventChange({ tenantId, actorUserId, action: 'speaker.updated', before, after: this.auditSpeaker(updated) });
    return updated;
  }

  async findByTenantEventAndEmail(tenantId: string, eventId: string, email: string): Promise<SpeakerEntity | null> {
    return this.speakerRepository.findOne({ where: { tenantId, eventId, email } });
  }

  private auditSpeaker(speaker: SpeakerEntity): Record<string, unknown> {
    return { id: speaker.id, eventId: speaker.eventId, firstName: speaker.firstName, lastName: speaker.lastName, email: speaker.email, status: speaker.status };
  }
}

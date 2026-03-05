import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { SpeakerEntity } from './entities/speaker.entity';

@Injectable()
export class SpeakerService {
  constructor(
    @InjectRepository(SpeakerEntity)
    private readonly speakerRepository: Repository<SpeakerEntity>,
  ) {}

  async create(input: DeepPartial<SpeakerEntity>): Promise<SpeakerEntity> {
    const speaker = this.speakerRepository.create(input);
    return this.speakerRepository.save(speaker);
  }

  async findByTenantAndEvent(tenantId: string, eventId: string): Promise<SpeakerEntity[]> {
    return this.speakerRepository.find({
      where: { tenantId, eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantEventAndId(
    tenantId: string,
    eventId: string,
    speakerId: string,
  ): Promise<SpeakerEntity | null> {
    return this.speakerRepository.findOne({
      where: { id: speakerId, tenantId, eventId },
    });
  }

  async findByTenantEventAndEmail(
    tenantId: string,
    eventId: string,
    email: string,
  ): Promise<SpeakerEntity | null> {
    return this.speakerRepository.findOne({
      where: { tenantId, eventId, email },
    });
  }

  async update(
    tenantId: string,
    eventId: string,
    speakerId: string,
    input: DeepPartial<SpeakerEntity>,
  ): Promise<SpeakerEntity | null> {
    const speaker = await this.findByTenantEventAndId(tenantId, eventId, speakerId);
    if (!speaker) {
      return null;
    }

    Object.assign(speaker, input);
    return this.speakerRepository.save(speaker);
  }

  async remove(tenantId: string, eventId: string, speakerId: string): Promise<boolean> {
    const result = await this.speakerRepository.delete({
      id: speakerId,
      tenantId,
      eventId,
    });

    return (result.affected ?? 0) > 0;
  }
}

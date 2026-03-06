import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BadgeEntity } from './entities/badge.entity';

@Injectable()
export class BadgePrintingService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly badgeRepository: Repository<BadgeEntity>,
  ) {}

  async getOrCreateBadge(attendeeId: string, eventId: string): Promise<BadgeEntity> {
    const existingBadge = await this.badgeRepository.findOne({
      where: { attendeeId },
    });

    if (existingBadge) {
      return existingBadge;
    }

    const now = new Date();
    const badge = this.badgeRepository.create({
      attendeeId,
      badgeId: this.buildBadgeId(attendeeId, eventId),
      qrCode: this.buildQrCode(attendeeId, eventId),
      printedAt: now,
    });

    return this.badgeRepository.save(badge);
  }

  private buildBadgeId(attendeeId: string, eventId: string): string {
    const compactEventId = eventId.replace(/-/g, '').slice(0, 8).toUpperCase();
    const compactAttendeeId = attendeeId.replace(/-/g, '').slice(0, 8).toUpperCase();

    return `BDG-${compactEventId}-${compactAttendeeId}`;
  }

  private buildQrCode(attendeeId: string, eventId: string): string {
    return JSON.stringify({
      attendeeId,
      eventId,
      issuedAt: new Date().toISOString(),
    });
  }
}

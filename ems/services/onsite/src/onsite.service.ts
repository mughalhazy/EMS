import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttendeeEntity, AttendeeStatus } from '../../attendee/src/entities/attendee.entity';
import { BadgePrintingService } from './badge-printing.service';
import { BadgeEntity } from './entities/badge.entity';
import { CheckInEntity } from './entities/check-in.entity';

export interface CheckInResult {
  checkIn: CheckInEntity;
  badge: BadgeEntity;
  firstCheckIn: boolean;
}

@Injectable()
export class OnsiteService {
  constructor(
    @InjectRepository(CheckInEntity)
    private readonly checkInRepository: Repository<CheckInEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    private readonly badgePrintingService: BadgePrintingService,
  ) {}

  async checkInAttendee(
    tenantId: string,
    eventId: string,
    attendeeId: string,
    deviceId: string,
  ): Promise<CheckInResult> {
    const attendee = await this.attendeeRepository.findOne({
      where: {
        id: attendeeId,
        tenantId,
        eventId,
      },
    });

    if (!attendee) {
      throw new NotFoundException(
        `Attendee ${attendeeId} was not found for the provided tenant and event.`,
      );
    }

    const existingCheckIn = await this.checkInRepository.findOne({
      where: {
        attendeeId,
        eventId,
      },
      order: {
        checkedInAt: 'ASC',
      },
    });

    const badge = await this.badgePrintingService.getOrCreateBadge(attendeeId, eventId);

    if (existingCheckIn) {
      return {
        checkIn: existingCheckIn,
        badge,
        firstCheckIn: false,
      };
    }

    const checkIn = this.checkInRepository.create({
      attendeeId,
      eventId,
      deviceId,
      checkedInAt: new Date(),
    });

    const savedCheckIn = await this.checkInRepository.save(checkIn);

    if (attendee.status !== AttendeeStatus.CHECKED_IN) {
      attendee.status = AttendeeStatus.CHECKED_IN;
      await this.attendeeRepository.save(attendee);
    }

    return {
      checkIn: savedCheckIn,
      badge,
      firstCheckIn: true,
    };
  }
}

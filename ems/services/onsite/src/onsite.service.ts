import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttendeeEntity, AttendeeStatus } from '../../attendee/src/entities/attendee.entity';
import { AttendeeScheduleEntity } from '../../agenda/src/entities/attendee-schedule.entity';
import { SessionEntity, SessionStatus } from '../../agenda/src/entities/session.entity';
import { BadgePrintingService } from './badge-printing.service';
import { OnsiteEventsPublisher } from './onsite-events.publisher';
import { BadgeEntity } from './entities/badge.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { ScanningDeviceEntity } from './entities/scanning-device.entity';
import { SessionCheckInEntity } from './entities/session-check-in.entity';

export interface CheckInResult {
  checkIn: CheckInEntity;
  badge: BadgeEntity;
  firstCheckIn: boolean;
}

export interface SessionScanResult {
  sessionCheckIn: SessionCheckInEntity;
  accessGranted: boolean;
}


export interface BadgePrintResult {
  badge: BadgeEntity;
  isReprint: boolean;
}

@Injectable()
export class OnsiteService {
  constructor(
    @InjectRepository(CheckInEntity)
    private readonly checkInRepository: Repository<CheckInEntity>,
    @InjectRepository(SessionCheckInEntity)
    private readonly sessionCheckInRepository: Repository<SessionCheckInEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    @InjectRepository(AttendeeScheduleEntity)
    private readonly attendeeScheduleRepository: Repository<AttendeeScheduleEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(ScanningDeviceEntity)
    private readonly scanningDeviceRepository: Repository<ScanningDeviceEntity>,
    private readonly badgePrintingService: BadgePrintingService,
    private readonly onsiteEventsPublisher: OnsiteEventsPublisher,
  ) {}

  async checkInAttendee(
    tenantId: string,
    eventId: string,
    attendeeId: string,
    deviceId: string,
  ): Promise<CheckInResult> {
    await this.assertActiveDevice(eventId, deviceId);

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

    await this.onsiteEventsPublisher.publishAttendeeCheckedIn({
      tenantId,
      eventId,
      attendeeId,
      checkInId: savedCheckIn.id,
      deviceId,
      checkedInAt: savedCheckIn.checkedInAt,
    });

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


  async printBadge(
    tenantId: string,
    eventId: string,
    attendeeId: string,
    deviceId: string,
  ): Promise<BadgePrintResult> {
    await this.assertActiveDevice(eventId, deviceId);

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

    return this.badgePrintingService.printBadge(attendeeId, eventId);
  }

  async scanSessionCheckIn(
    tenantId: string,
    eventId: string,
    sessionId: string,
    attendeeId: string,
    deviceId: string,
  ): Promise<SessionScanResult> {
    const attendee = await this.attendeeRepository.findOne({ where: { id: attendeeId, tenantId, eventId } });

    if (!attendee) {
      throw new NotFoundException(`Attendee ${attendeeId} was not found for the provided tenant and event.`);
    }

    const session = await this.sessionRepository.findOne({ where: { id: sessionId, tenantId, eventId } });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} was not found for the provided tenant and event.`);
    }

    await this.assertActiveDevice(eventId, deviceId);


    if (attendee.status !== AttendeeStatus.CHECKED_IN) {
      throw new ForbiddenException('Attendee must complete event check-in before session scanning.');
    }

    const hasScheduleAccess = await this.attendeeScheduleRepository.exists({
      where: {
        tenantId,
        eventId,
        attendeeId,
        sessionId,
      },
    });

    const denialReason = this.resolveDenialReason(session.status, hasScheduleAccess);

    const existingScan = await this.sessionCheckInRepository.findOne({
      where: {
        eventId,
        attendeeId,
        sessionId,
      },
      order: {
        scannedAt: 'ASC',
      },
    });

    if (existingScan) {
      return {
        sessionCheckIn: existingScan,
        accessGranted: existingScan.accessGranted,
      };
    }

    const sessionCheckIn = await this.sessionCheckInRepository.save(
      this.sessionCheckInRepository.create({
        tenantId,
        eventId,
        attendeeId,
        sessionId,
        deviceId,
        accessGranted: denialReason === null,
        denialReason,
        scannedAt: new Date(),
      }),
    );

    return {
      sessionCheckIn,
      accessGranted: sessionCheckIn.accessGranted,
    };
  }


  private async assertActiveDevice(eventId: string, deviceId: string): Promise<void> {
    const device = await this.scanningDeviceRepository.findOne({
      where: {
        deviceId,
        eventId,
      },
    });

    if (!device || device.status.toLowerCase() !== 'active') {
      throw new ForbiddenException('Scanning device is not registered as active for this event.');
    }
  }

  private resolveDenialReason(
    sessionStatus: SessionStatus,
    hasScheduleAccess: boolean,
  ): string | null {
    if (sessionStatus !== SessionStatus.SCHEDULED) {
      return 'Session is not in a scannable state.';
    }

    if (!hasScheduleAccess) {
      return 'Attendee does not have access to this session.';
    }

    return null;
  }
}

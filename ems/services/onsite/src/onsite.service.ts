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
import { BadgeEntity } from './entities/badge.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { ScanningDeviceEntity } from './entities/scanning-device.entity';
import { SessionCheckInEntity } from './entities/session-check-in.entity';
import { OnsiteEventsPublisher } from './onsite-events.publisher';

export interface CheckInResult {
  checkIn: CheckInEntity;
  badge: BadgeEntity;
  firstCheckIn: boolean;
}

export interface SessionScanResult {
  sessionCheckIn: SessionCheckInEntity;
  accessGranted: boolean;
}


export interface ScanningDeviceResult {
  device: ScanningDeviceEntity;
  isNewRegistration: boolean;
}

export interface DeviceMonitorResult {
  deviceId: string;
  status: string;
  totalEventCheckIns: number;
  totalSessionScans: number;
  lastSeenAt: Date | null;
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


  async registerScanningDevice(
    tenantId: string,
    eventId: string,
    deviceId: string,
    status: string,
  ): Promise<ScanningDeviceResult> {
    void tenantId;

    const existingDevice = await this.scanningDeviceRepository.findOne({
      where: {
        deviceId,
        eventId,
      },
    });

    if (existingDevice) {
      existingDevice.status = status.toLowerCase();
      const updatedDevice = await this.scanningDeviceRepository.save(existingDevice);
      return {
        device: updatedDevice,
        isNewRegistration: false,
      };
    }

    const device = await this.scanningDeviceRepository.save(
      this.scanningDeviceRepository.create({
        deviceId,
        eventId,
        status: status.toLowerCase(),
      }),
    );

    return {
      device,
      isNewRegistration: true,
    };
  }

  async updateScanningDeviceStatus(
    tenantId: string,
    eventId: string,
    deviceId: string,
    status: string,
  ): Promise<ScanningDeviceResult> {
    void tenantId;

    const device = await this.scanningDeviceRepository.findOne({
      where: {
        deviceId,
        eventId,
      },
    });

    if (!device) {
      throw new NotFoundException(
        `Scanning device ${deviceId} was not found for the provided event.`,
      );
    }

    device.status = status.toLowerCase();

    const updatedDevice = await this.scanningDeviceRepository.save(device);

    return {
      device: updatedDevice,
      isNewRegistration: false,
    };
  }

  async monitorScanningDevices(
    tenantId: string,
    eventId: string,
  ): Promise<DeviceMonitorResult[]> {
    const devices = await this.scanningDeviceRepository.find({
      where: {
        eventId,
      },
      order: {
        deviceId: 'ASC',
      },
    });

    if (devices.length === 0) {
      return [];
    }

    const eventCheckInRows = await this.checkInRepository
      .createQueryBuilder('checkIn')
      .select('checkIn.deviceId', 'deviceId')
      .addSelect('COUNT(checkIn.id)', 'totalEventCheckIns')
      .addSelect('MAX(checkIn.checkedInAt)', 'lastEventCheckInAt')
      .where('checkIn.eventId = :eventId', { eventId })
      .groupBy('checkIn.deviceId')
      .getRawMany<{
        deviceId: string;
        totalEventCheckIns: string;
        lastEventCheckInAt: Date | null;
      }>();

    const sessionScanRows = await this.sessionCheckInRepository
      .createQueryBuilder('sessionCheckIn')
      .select('sessionCheckIn.deviceId', 'deviceId')
      .addSelect('COUNT(sessionCheckIn.id)', 'totalSessionScans')
      .addSelect('MAX(sessionCheckIn.scannedAt)', 'lastSessionScanAt')
      .where('sessionCheckIn.tenantId = :tenantId', { tenantId })
      .andWhere('sessionCheckIn.eventId = :eventId', { eventId })
      .groupBy('sessionCheckIn.deviceId')
      .getRawMany<{
        deviceId: string;
        totalSessionScans: string;
        lastSessionScanAt: Date | null;
      }>();

    const eventStatsByDeviceId = new Map(
      eventCheckInRows.map((row) => [
        row.deviceId,
        {
          totalEventCheckIns: Number.parseInt(row.totalEventCheckIns, 10),
          lastEventCheckInAt: row.lastEventCheckInAt,
        },
      ]),
    );

    const sessionStatsByDeviceId = new Map(
      sessionScanRows.map((row) => [
        row.deviceId,
        {
          totalSessionScans: Number.parseInt(row.totalSessionScans, 10),
          lastSessionScanAt: row.lastSessionScanAt,
        },
      ]),
    );

    return devices.map((device) => {
      const eventStats = eventStatsByDeviceId.get(device.deviceId);
      const sessionStats = sessionStatsByDeviceId.get(device.deviceId);
      const timestamps = [eventStats?.lastEventCheckInAt, sessionStats?.lastSessionScanAt]
        .filter((value): value is Date => value !== null && value !== undefined)
        .map((value) => new Date(value));

      return {
        deviceId: device.deviceId,
        status: device.status,
        totalEventCheckIns: eventStats?.totalEventCheckIns ?? 0,
        totalSessionScans: sessionStats?.totalSessionScans ?? 0,
        lastSeenAt: timestamps.length > 0 ? timestamps.sort((a, b) => b.getTime() - a.getTime())[0] : null,
      };
    });
  }

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

    const device = await this.scanningDeviceRepository.findOne({
      where: {
        deviceId,
        eventId,
      },
    });

    if (!device || device.status.toLowerCase() !== 'active') {
      throw new ForbiddenException('Scanning device is not registered as active for this event.');
    }

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

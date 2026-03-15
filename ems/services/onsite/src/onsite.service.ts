import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttendeeEntity, AttendeeStatus } from '../../attendee/src/entities/attendee.entity';
import { AuditService } from '../../audit/src/audit.service';
import { AttendeeScheduleEntity } from '../../agenda/src/entities/attendee-schedule.entity';
import { SessionEntity, SessionStatus } from '../../agenda/src/entities/session.entity';
import { BadgePrintingService } from './badge-printing.service';
import { OnsiteEventsPublisher } from './onsite-events.publisher';
import { BadgeEntity } from './entities/badge.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { ScanningDeviceEntity } from './entities/scanning-device.entity';
import { SessionAttendanceEntity } from './entities/session-attendance.entity';
import { SessionCheckInEntity } from './entities/session-check-in.entity';
import { QrTicketValidationService } from './qr-ticket-validation.service';

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

export interface BadgeValidationResult {
  badge: BadgeEntity | null;
  isValid: boolean;
  reason: string | null;
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
    @InjectRepository(SessionAttendanceEntity)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceEntity>,
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
    private readonly qrTicketValidationService: QrTicketValidationService,
    private readonly auditService: AuditService,
  ) {}


  async registerScanningDevice(
    tenantId: string,
    eventId: string,
    deviceId: string,
    status: string,
  ): Promise<ScanningDeviceResult> {
    const existingDevice = await this.scanningDeviceRepository.findOne({
      where: {
        tenantId,
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
        tenantId,
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
    const device = await this.scanningDeviceRepository.findOne({
      where: {
        tenantId,
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
        tenantId,
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
    await this.assertActiveDevice(tenantId, eventId, deviceId);

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

    if (existingCheckIn) {
      const badge = await this.badgePrintingService.getOrCreateBadge(attendeeId, eventId);
      await this.auditService.trackOnsiteChange({
        tenantId,
        targetUserId: attendee.userId,
        action: 'onsite.attendee.check_in.duplicate_scan',
        before: null,
        after: {
          checkInId: existingCheckIn.id,
          checkedInAt: existingCheckIn.checkedInAt,
        },
        metadata: {
          eventId,
          attendeeId,
          deviceId,
        },
      });

      return {
        checkIn: existingCheckIn,
        badge,
        firstCheckIn: false,
      };
    }

    const { badge } = await this.badgePrintingService.printBadge(attendeeId, eventId);

    const checkIn = this.checkInRepository.create({
      attendeeId,
      eventId,
      deviceId,
      checkedInAt: new Date(),
    });

    const savedCheckIn = await this.checkInRepository.save(checkIn);

    await this.onsiteEventsPublisher.publishOnsiteCheckInCompleted({
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

    await this.auditService.trackOnsiteChange({
      tenantId,
      targetUserId: attendee.userId,
      action: 'onsite.attendee.checked_in',
      before: null,
      after: {
        checkInId: savedCheckIn.id,
        checkedInAt: savedCheckIn.checkedInAt,
      },
      metadata: {
        eventId,
        attendeeId,
        deviceId,
        badgeId: badge.id,
      },
    });

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
    await this.assertActiveDevice(tenantId, eventId, deviceId);

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

    const badgePrintResult = await this.badgePrintingService.printBadge(attendeeId, eventId);

    await this.onsiteEventsPublisher.publishOnsiteBadgePrinted({
      tenantId,
      eventId,
      attendeeId,
      badgeId: badgePrintResult.badge.badgeId,
      deviceId,
      printedAt: badgePrintResult.badge.printedAt,
      isReprint: badgePrintResult.isReprint,
    });

    await this.auditService.trackOnsiteChange({
      tenantId,
      targetUserId: attendee.userId,
      action: badgePrintResult.isReprint ? 'onsite.badge.reprinted' : 'onsite.badge.printed',
      before: null,
      after: {
        badgeId: badgePrintResult.badge.id,
        printedAt: badgePrintResult.badge.printedAt,
      },
      metadata: {
        eventId,
        attendeeId,
        deviceId,
      },
    });

    return badgePrintResult;
  }

  async validateBadge(
    tenantId: string,
    eventId: string,
    badgeId: string,
    attendeeId?: string,
  ): Promise<BadgeValidationResult> {
    const normalizedBadgeId = badgeId.trim();

    const badge = await this.badgePrintingService.findBadgeByBadgeId(normalizedBadgeId);

    if (!badge) {
      return {
        badge: null,
        isValid: false,
        reason: 'Badge was not found.',
      };
    }

    const attendee = await this.attendeeRepository.findOne({
      where: {
        id: badge.attendeeId,
        tenantId,
        eventId,
      },
    });

    if (!attendee) {
      return {
        badge,
        isValid: false,
        reason: 'Badge is not assigned to an attendee in this event.',
      };
    }

    if (attendeeId && attendee.id !== attendeeId) {
      return {
        badge,
        isValid: false,
        reason: 'Badge does not belong to the provided attendee.',
      };
    }

    return {
      badge,
      isValid: true,
      reason: null,
    };
  }

  async scanSessionCheckIn(
    tenantId: string,
    eventId: string,
    sessionId: string,
    attendeeId: string,
    deviceId: string,
    qrTicketCode?: string,
  ): Promise<SessionScanResult> {
    const attendee = await this.attendeeRepository.findOne({ where: { id: attendeeId, tenantId, eventId } });

    if (!attendee) {
      throw new NotFoundException(`Attendee ${attendeeId} was not found for the provided tenant and event.`);
    }

    const session = await this.sessionRepository.findOne({ where: { id: sessionId, tenantId, eventId } });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} was not found for the provided tenant and event.`);
    }

    await this.assertActiveDevice(tenantId, eventId, deviceId);

    this.qrTicketValidationService.assertValidTicket({
      qrTicketCode,
      attendeeId,
      eventId,
    });

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
      await this.auditService.trackOnsiteChange({
        tenantId,
        targetUserId: attendee.userId,
        action: 'onsite.session_scan.duplicate_scan',
        before: null,
        after: {
          sessionCheckInId: existingScan.id,
          scannedAt: existingScan.scannedAt,
          accessGranted: existingScan.accessGranted,
          denialReason: existingScan.denialReason,
        },
        metadata: {
          eventId,
          attendeeId,
          sessionId,
          deviceId,
        },
      });

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

    if (sessionCheckIn.accessGranted) {
      await this.sessionAttendanceRepository.save(
        this.sessionAttendanceRepository.create({
          attendeeId,
          sessionId,
          scannedAt: sessionCheckIn.scannedAt,
        }),
      );
    }

    await this.onsiteEventsPublisher.publishSessionAttendanceScanned({
      tenantId,
      eventId,
      attendeeId,
      sessionId,
      sessionCheckInId: sessionCheckIn.id,
      deviceId,
      scannedAt: sessionCheckIn.scannedAt,
      accessGranted: sessionCheckIn.accessGranted,
      denialReason: sessionCheckIn.denialReason,
    });

    await this.auditService.trackOnsiteChange({
      tenantId,
      targetUserId: attendee.userId,
      action: sessionCheckIn.accessGranted ? 'onsite.session_scan.access_granted' : 'onsite.session_scan.access_denied',
      before: null,
      after: {
        sessionCheckInId: sessionCheckIn.id,
        scannedAt: sessionCheckIn.scannedAt,
        accessGranted: sessionCheckIn.accessGranted,
        denialReason: sessionCheckIn.denialReason,
      },
      metadata: {
        eventId,
        attendeeId,
        sessionId,
        deviceId,
      },
    });

    return {
      sessionCheckIn,
      accessGranted: sessionCheckIn.accessGranted,
    };
  }


  private async assertActiveDevice(tenantId: string, eventId: string, deviceId: string): Promise<void> {
    const device = await this.scanningDeviceRepository.findOne({
      where: {
        tenantId,
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

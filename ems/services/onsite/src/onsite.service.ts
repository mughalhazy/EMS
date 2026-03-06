import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttendeeEntity, AttendeeStatus } from '../../attendee/src/entities/attendee.entity';
import {
  TicketFulfillmentEntity,
  TicketFulfillmentStatus,
} from '../../commerce/src/entities/ticket-fulfillment.entity';
import { RegistrationEntity, RegistrationStatus } from '../../registration/src/entities/registration.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { ScanningDeviceEntity } from './entities/scanning-device.entity';

const ALLOWED_REGISTRATION_STATUSES: ReadonlySet<RegistrationStatus> = new Set([
  RegistrationStatus.CONFIRMED,
  RegistrationStatus.APPROVED,
]);

const ALLOWED_FULFILLMENT_STATUSES: ReadonlySet<TicketFulfillmentStatus> = new Set([
  TicketFulfillmentStatus.GENERATED,
  TicketFulfillmentStatus.ATTACHED,
]);

export interface CheckInAttendeeInput {
  tenantId: string;
  eventId: string;
  attendeeId: string;
  qrCode: string;
  deviceId: string;
}

export interface TicketValidationResult {
  attendee: AttendeeEntity;
  registration: RegistrationEntity;
  ticketFulfillment: TicketFulfillmentEntity;
}

@Injectable()
export class OnsiteService {
  constructor(
    @InjectRepository(CheckInEntity)
    private readonly checkInRepository: Repository<CheckInEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    @InjectRepository(TicketFulfillmentEntity)
    private readonly ticketFulfillmentRepository: Repository<TicketFulfillmentEntity>,
    @InjectRepository(ScanningDeviceEntity)
    private readonly scanningDeviceRepository: Repository<ScanningDeviceEntity>,
  ) {}

  async checkInAttendee(input: CheckInAttendeeInput): Promise<CheckInEntity> {
    return this.checkInRepository.manager.transaction(async (manager) => {
      const checkInRepo = manager.getRepository(CheckInEntity);
      const attendeeRepo = manager.getRepository(AttendeeEntity);

      const validation = await this.validateTicketForCheckIn(input);

      const existing = await checkInRepo.findOne({
        where: {
          attendeeId: input.attendeeId,
          eventId: input.eventId,
        },
      });

      if (existing) {
        throw new BadRequestException('Attendee already checked in for this event.');
      }

      const checkIn = checkInRepo.create({
        attendeeId: validation.attendee.id,
        eventId: validation.attendee.eventId,
        checkedInAt: new Date(),
        deviceId: input.deviceId,
      });

      const savedCheckIn = await checkInRepo.save(checkIn);

      if (validation.attendee.status !== AttendeeStatus.CHECKED_IN) {
        validation.attendee.status = AttendeeStatus.CHECKED_IN;
        await attendeeRepo.save(validation.attendee);
      }

      return savedCheckIn;
    });
  }

  async validateTicketForCheckIn(input: CheckInAttendeeInput): Promise<TicketValidationResult> {
    const [attendee, ticketFulfillment] = await Promise.all([
      this.attendeeRepository.findOne({
        where: {
          id: input.attendeeId,
          tenantId: input.tenantId,
          eventId: input.eventId,
        },
      }),
      this.ticketFulfillmentRepository.findOne({
        where: {
          tenantId: input.tenantId,
          qrCode: input.qrCode,
        },
      }),
    ]);

    if (!attendee) {
      throw new NotFoundException('Attendee not found for event in tenant.');
    }

    await this.assertDeviceIsRegistered(input.eventId, input.deviceId);

    if (!ticketFulfillment || !ALLOWED_FULFILLMENT_STATUSES.has(ticketFulfillment.status)) {
      throw new BadRequestException('Ticket QR code is invalid or not active.');
    }

    const registration = await this.registrationRepository.findOne({
      where: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        orderId: ticketFulfillment.orderId,
        orderItemId: ticketFulfillment.orderItemId,
        attendeeIndex: ticketFulfillment.attendeeIndex,
      },
    });

    if (!registration) {
      throw new BadRequestException('No event registration matches this ticket.');
    }

    if (!ALLOWED_REGISTRATION_STATUSES.has(registration.status)) {
      throw new BadRequestException('Registration is not eligible for check-in.');
    }

    this.assertRegistrationBelongsToAttendee(registration, attendee, ticketFulfillment);

    return {
      attendee,
      registration,
      ticketFulfillment,
    };
  }

  private async assertDeviceIsRegistered(eventId: string, deviceId: string): Promise<void> {
    const scanningDevice = await this.scanningDeviceRepository.findOne({
      where: {
        eventId,
        deviceId,
      },
    });

    if (!scanningDevice || scanningDevice.status.toLowerCase() !== 'active') {
      throw new BadRequestException('Scanning device is not active for this event.');
    }
  }

  private assertRegistrationBelongsToAttendee(
    registration: RegistrationEntity,
    attendee: AttendeeEntity,
    fulfillment: TicketFulfillmentEntity,
  ): void {
    if (attendee.userId && attendee.userId === registration.userId) {
      return;
    }

    const metadataAttendeeEmail = this.extractFulfillmentAttendeeEmail(fulfillment);
    if (metadataAttendeeEmail && metadataAttendeeEmail === attendee.email.toLowerCase()) {
      return;
    }

    throw new BadRequestException('Ticket is not assigned to this attendee.');
  }

  private extractFulfillmentAttendeeEmail(fulfillment: TicketFulfillmentEntity): string | null {
    const metadataAttendee = fulfillment.metadata?.attendee;
    if (!metadataAttendee || typeof metadataAttendee !== 'object' || Array.isArray(metadataAttendee)) {
      return null;
    }

    const email = Reflect.get(metadataAttendee, 'email');
    if (typeof email !== 'string' || !email.trim()) {
      return null;
    }

    return email.trim().toLowerCase();
  }
}

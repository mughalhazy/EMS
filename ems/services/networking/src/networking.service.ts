import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import {
  AttendeeConnectionEntity,
  AttendeeConnectionStatus,
} from './entities/attendee-connection.entity';
import { NetworkingEventsPublisher } from './networking-events.publisher';

@Injectable()
export class NetworkingService {
  constructor(
    @InjectRepository(AttendeeConnectionEntity)
    private readonly connectionRepository: Repository<AttendeeConnectionEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    private readonly networkingEventsPublisher: NetworkingEventsPublisher,
    private readonly auditService: AuditService,
  ) {}

  async sendConnectionRequest(
    tenantId: string,
    eventId: string,
    requesterAttendeeId: string,
    recipientAttendeeId: string,
  ): Promise<AttendeeConnectionEntity> {
    if (requesterAttendeeId === recipientAttendeeId) {
      throw new BadRequestException('Attendees cannot connect with themselves.');
    }

    await this.assertAttendeeInEvent(tenantId, eventId, requesterAttendeeId);
    await this.assertAttendeeInEvent(tenantId, eventId, recipientAttendeeId);

    const [attendeeAId, attendeeBId] =
      requesterAttendeeId < recipientAttendeeId
        ? [requesterAttendeeId, recipientAttendeeId]
        : [recipientAttendeeId, requesterAttendeeId];

    const existingConnection = await this.connectionRepository.findOne({
      where: {
        tenantId,
        eventId,
        attendeeAId,
        attendeeBId,
      },
    });

    if (existingConnection) {
      if (existingConnection.status === AttendeeConnectionStatus.DECLINED) {
        existingConnection.status = AttendeeConnectionStatus.PENDING;
        const reopenedConnection = await this.connectionRepository.save(existingConnection);
        await this.networkingEventsPublisher.publishConnectionRequested(reopenedConnection, { tenantId, eventId });
        return reopenedConnection;
      }

      throw new ConflictException(
        `Connection cannot be requested while status is ${existingConnection.status}.`,
      );
    }

    const connection = this.connectionRepository.create({
      tenantId,
      eventId,
      attendeeAId,
      attendeeBId,
      status: AttendeeConnectionStatus.PENDING,
    });

    const savedConnection = await this.connectionRepository.save(connection);
    await this.networkingEventsPublisher.publishConnectionRequested(savedConnection, { tenantId, eventId });
    await this.auditService.trackEventChange({
      tenantId,
      action: 'networking.connection.requested',
      after: {
        connectionId: savedConnection.id,
        attendeeAId: savedConnection.attendeeAId,
        attendeeBId: savedConnection.attendeeBId,
        status: savedConnection.status,
      },
    });

    return savedConnection;
  }

  async acceptConnectionRequest(
    tenantId: string,
    eventId: string,
    connectionId: string,
    attendeeId: string,
  ): Promise<AttendeeConnectionEntity> {
    await this.assertAttendeeInEvent(tenantId, eventId, attendeeId);

    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId, tenantId, eventId },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found.');
    }

    if (
      connection.attendeeAId !== attendeeId &&
      connection.attendeeBId !== attendeeId
    ) {
      throw new BadRequestException('Attendee is not a participant in this request.');
    }

    if (connection.status !== AttendeeConnectionStatus.PENDING) {
      throw new ConflictException(
        `Connection request cannot be accepted while status is ${connection.status}.`,
      );
    }

    connection.status = AttendeeConnectionStatus.ACCEPTED;
    const acceptedConnection = await this.connectionRepository.save(connection);
    await this.networkingEventsPublisher.publishAttendeeConnected(acceptedConnection, {
      tenantId,
      eventId,
    });
    await this.auditService.trackEventChange({
      tenantId,
      action: 'networking.connection.accepted',
      after: {
        connectionId: acceptedConnection.id,
        attendeeAId: acceptedConnection.attendeeAId,
        attendeeBId: acceptedConnection.attendeeBId,
        status: acceptedConnection.status,
      },
    });

    return acceptedConnection;
  }

  private async assertAttendeeInEvent(
    tenantId: string,
    eventId: string,
    attendeeId: string,
  ): Promise<void> {
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
  }
}

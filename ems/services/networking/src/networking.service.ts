import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
        attendeeAId,
        attendeeBId,
      },
    });

    if (existingConnection) {
      if (existingConnection.status === AttendeeConnectionStatus.DECLINED) {
        existingConnection.status = AttendeeConnectionStatus.PENDING;
        return this.connectionRepository.save(existingConnection);
      }

      throw new ConflictException(
        `Connection cannot be requested while status is ${existingConnection.status}.`,
      );
    }

    const connection = this.connectionRepository.create({
      attendeeAId,
      attendeeBId,
      status: AttendeeConnectionStatus.PENDING,
    });

    return this.connectionRepository.save(connection);
  }

  async acceptConnectionRequest(
    tenantId: string,
    eventId: string,
    connectionId: string,
    attendeeId: string,
  ): Promise<AttendeeConnectionEntity> {
    await this.assertAttendeeInEvent(tenantId, eventId, attendeeId);

    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
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

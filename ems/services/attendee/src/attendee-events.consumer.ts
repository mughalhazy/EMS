import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { REGISTRATION_CONFIRMED_TOPIC } from '../../registration/src/registration-events.publisher';
import { AttendeeService, ConfirmedRegistrationEventPayload } from './attendee.service';

@Injectable()
export class AttendeeEventsConsumer {
  private readonly logger = new Logger(AttendeeEventsConsumer.name);

  constructor(private readonly attendeeService: AttendeeService) {}

  @EventPattern(REGISTRATION_CONFIRMED_TOPIC)
  async handleRegistrationConfirmed(
    @Payload() payload: ConfirmedRegistrationEventPayload,
  ): Promise<void> {
    const attendee = await this.attendeeService.createFromConfirmedRegistration(payload);

    if (!attendee) {
      this.logger.warn(
        `No attendee generated for registration '${payload.registration_id}' from topic '${REGISTRATION_CONFIRMED_TOPIC}'.`,
      );
      return;
    }

    this.logger.log(
      `Generated attendee '${attendee.id}' for confirmed registration '${payload.registration_id}'.`,
    );
  }
}

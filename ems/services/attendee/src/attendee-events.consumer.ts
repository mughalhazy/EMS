import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { readDistributedTrace } from '../../audit/src/distributed-tracing';

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
    const trace = readDistributedTrace(payload as Record<string, unknown>);
    const attendee = await this.attendeeService.createFromConfirmedRegistration(payload);

    if (!attendee) {
      this.logger.warn(
        JSON.stringify({
          event: 'attendee.generation.skipped',
          registrationId: payload.registration_id,
          topic: REGISTRATION_CONFIRMED_TOPIC,
        }),
      );
      return;
    }

    this.logger.log(
      JSON.stringify({
        event: 'attendee.generated',
        attendeeId: attendee.id,
        registrationId: payload.registration_id,
      }),
    );
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';

export interface ValidateQrTicketInput {
  qrTicketCode?: string;
  attendeeId: string;
  eventId: string;
}

@Injectable()
export class QrTicketValidationService {
  assertValidTicket(input: ValidateQrTicketInput): void {
    if (!input.qrTicketCode) {
      return;
    }

    let payload: Record<string, unknown>;

    try {
      payload = JSON.parse(input.qrTicketCode) as Record<string, unknown>;
    } catch {
      throw new BadRequestException('Invalid QR ticket payload.');
    }

    if (payload.attendeeId !== input.attendeeId || payload.eventId !== input.eventId) {
      throw new BadRequestException('QR ticket does not match attendee or event context.');
    }
  }
}

import { EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  organizationId!: string;
  name!: string;
  code!: string;
  description?: string | null;
  timezone!: string;
  startAt!: string;
  endAt!: string;
  status?: EventStatus;
  templateEventId?: string;
  agenda?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
}

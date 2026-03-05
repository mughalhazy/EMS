import { EventStatus } from '../entities/event.entity';

export class UpdateEventDto {
  organizationId?: string;
  name?: string;
  code?: string;
  description?: string | null;
  timezone?: string;
  startAt?: string;
  endAt?: string;
  status?: EventStatus;
}

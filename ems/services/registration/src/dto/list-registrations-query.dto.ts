import { RegistrationStatus } from '../entities/registration-status.entity';

export class ListRegistrationsQueryDto {
  eventId?: string;
  userId?: string;
  status?: RegistrationStatus;
}

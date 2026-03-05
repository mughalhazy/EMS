import { RegistrationStatus } from '../entities/registration.entity';

export class ListRegistrationsQueryDto {
  eventId?: string;
  userId?: string;
  status?: RegistrationStatus;
}

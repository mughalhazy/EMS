import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { RegistrationStatus } from '../entities/registration-status.entity';

export class ListRegistrationsQueryDto {
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;
}

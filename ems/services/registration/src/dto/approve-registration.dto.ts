import { IsOptional, IsUUID } from 'class-validator';

export class ApproveRegistrationDto {
  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}

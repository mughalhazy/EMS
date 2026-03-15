import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ValidateBadgeDto {
  @IsString()
  badgeId!: string;

  @IsOptional()
  @IsUUID()
  attendeeId?: string;
}


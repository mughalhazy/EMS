import { IsISO8601, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RecordBoothInteractionDto {
  @IsUUID()
  attendeeId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  interactionType?: string;

  @IsOptional()
  @IsISO8601()
  interactedAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class CaptureLeadDto {
  @IsUUID()
  attendeeId!: string;

  @IsOptional()
  @IsISO8601()
  capturedAt?: string;
}

import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ScanSessionCheckInDto {
  @IsUUID()
  attendeeId!: string;

  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  qrTicketCode?: string;
}

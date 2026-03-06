import { IsString, IsUUID } from 'class-validator';

export class ScanSessionCheckInDto {
  @IsUUID()
  attendeeId!: string;

  @IsString()
  deviceId!: string;
}

import { IsString, IsUUID } from 'class-validator';

export class PrintBadgeDto {
  @IsUUID()
  attendeeId!: string;

  @IsString()
  deviceId!: string;
}

import { IsString, IsUUID } from 'class-validator';

export class CheckInAttendeeDto {
  @IsUUID()
  attendeeId!: string;

  @IsString()
  deviceId!: string;
}

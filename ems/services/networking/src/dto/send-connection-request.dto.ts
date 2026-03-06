import { IsUUID } from 'class-validator';

export class SendConnectionRequestDto {
  @IsUUID()
  requesterAttendeeId!: string;

  @IsUUID()
  recipientAttendeeId!: string;
}

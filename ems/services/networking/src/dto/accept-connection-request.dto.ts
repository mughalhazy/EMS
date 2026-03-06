import { IsUUID } from 'class-validator';

export class AcceptConnectionRequestDto {
  @IsUUID()
  attendeeId!: string;
}

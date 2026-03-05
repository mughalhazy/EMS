import { IsUUID } from 'class-validator';

export class AssignSpeakerDto {
  @IsUUID()
  speakerId!: string;
}

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  attendeeId!: string;

  @IsString()
  @IsNotEmpty()
  question!: string;
}

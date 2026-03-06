import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { PollStatus } from '../entities/poll.entity';

export class CreatePollDto {
  @IsUUID()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  question!: string;

  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  options!: string[];

  @IsOptional()
  @IsEnum(PollStatus)
  status?: PollStatus;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

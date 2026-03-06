import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { PollStatus } from '../entities/poll.entity';

export class UpdatePollDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  question?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  options?: string[];

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

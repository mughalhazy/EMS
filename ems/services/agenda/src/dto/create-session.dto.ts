import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

import { SessionStatus } from '../entities/session.entity';

export class CreateSessionDto {
  @IsUUID()
  roomId!: string;

  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsInt()
  @Min(0)
  capacity!: number;

  @IsInt()
  @Min(1)
  agendaOrder!: number;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}

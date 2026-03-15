import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { SessionStatus } from '../entities/session.entity';

export class QueryAgendaDto {
  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsUUID()
  speakerId?: string;

  @IsOptional()
  @IsDateString()
  startsAfter?: string;

  @IsOptional()
  @IsDateString()
  endsBefore?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

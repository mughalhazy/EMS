import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

import { EngagementSurveyStatus } from '../entities/engagement-survey.entity';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EngagementSurveyStatus)
  status?: EngagementSurveyStatus;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsDateString()
  openAt?: string;

  @IsOptional()
  @IsDateString()
  closeAt?: string;

  @IsOptional()
  @IsArray()
  questions?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

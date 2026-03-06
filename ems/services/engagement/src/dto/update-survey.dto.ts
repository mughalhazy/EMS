import { IsArray, IsBoolean, IsDateString, IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

import { SurveyStatus } from '../../../event/src/entities/survey.entity';

export class UpdateSurveyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

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

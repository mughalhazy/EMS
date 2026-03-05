import { IsArray, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { SpeakerStatus } from '../entities/speaker.entity';

export class CreateSpeakerDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsString()
  @MaxLength(120)
  firstName!: string;

  @IsString()
  @MaxLength(120)
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  xUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  locationLabel?: string;

  @IsOptional()
  @IsArray()
  expertiseTags?: string[];

  @IsOptional()
  @IsEnum(SpeakerStatus)
  status?: SpeakerStatus;
}

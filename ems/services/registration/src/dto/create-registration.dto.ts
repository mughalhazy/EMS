import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegistrantAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  value!: string;
}

export class CreateRegistrantNameDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  preferredName?: string;
}

export class CreateRegistrantContactDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateRegistrantProfileDto {
  @ValidateNested()
  @Type(() => CreateRegistrantNameDto)
  name!: CreateRegistrantNameDto;

  @ValidateNested()
  @Type(() => CreateRegistrantContactDto)
  contact!: CreateRegistrantContactDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegistrantAnswerDto)
  answers!: CreateRegistrantAnswerDto[];
}

export class CreateRegistrationDto {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  userId!: string;

  @IsUUID()
  ticketId!: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  orderItemId?: string;

  @IsOptional()
  @IsInt()
  attendeeIndex?: number;

  @ValidateNested()
  @Type(() => CreateRegistrantProfileDto)
  profile!: CreateRegistrantProfileDto;
}

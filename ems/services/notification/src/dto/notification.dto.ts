import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString() @IsNotEmpty() userId: string;
  @IsIn(['email', 'sms', 'push', 'in_app']) @IsOptional() channel?: string;
  @IsString() @IsOptional() recipientAddress?: string;
  @IsString() @IsOptional() subject?: string;
  @IsString() @IsNotEmpty() body: string;
}

export class CreateTemplateDto {
  @IsString() @IsNotEmpty() name: string;
  @IsIn(['email', 'sms', 'push', 'in_app']) @IsOptional() channel?: string;
  @IsString() @IsOptional() subject?: string;
  @IsString() @IsNotEmpty() bodyTemplate: string;
}

export class CreateCampaignDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() subject: string;
  @IsString() @IsNotEmpty() body: string;
  @IsIn(['email', 'sms', 'push', 'in_app']) @IsOptional() channel?: string;
  @IsDateString() @IsOptional() scheduledAt?: string;
}

import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWebhookSubscriptionDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() targetUrl: string;
  @IsArray() @IsString({ each: true }) eventTypes: string[];
  @IsString() @IsOptional() @MinLength(16) secret?: string;
}

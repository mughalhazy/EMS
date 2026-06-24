import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @IsString() @IsNotEmpty() attendeeId: string;
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsOptional() sessionId?: string;
  @IsString() @IsOptional() deviceId?: string;
}

export class PrintBadgeDto {
  @IsString() @IsNotEmpty() attendeeId: string;
  @IsString() @IsNotEmpty() eventId: string;
  @IsNumber() @IsOptional() copies?: number;
  @IsString() @IsOptional() deviceId?: string;
}

export class StartDeviceSessionDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() deviceId: string;
  @IsString() @IsOptional() staffUserId?: string;
}

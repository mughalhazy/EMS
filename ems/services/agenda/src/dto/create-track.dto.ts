import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrackDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
}

export class UpdateTrackDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
}

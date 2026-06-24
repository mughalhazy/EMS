import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertSettingsDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string;
}

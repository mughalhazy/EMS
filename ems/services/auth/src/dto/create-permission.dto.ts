import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(64)
  resource!: string;

  @IsString()
  @MaxLength(64)
  action!: string;

  @IsString()
  @MaxLength(128)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

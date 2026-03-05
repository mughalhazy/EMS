import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { RoleScope } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsOptional()
  @IsEnum(RoleScope)
  scope?: RoleScope;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}

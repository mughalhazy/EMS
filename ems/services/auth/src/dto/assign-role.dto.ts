import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsIn(['tenant', 'organization', 'event'])
  scopeType?: 'tenant' | 'organization' | 'event';

  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  plan?: string;

  @IsIn(['active', 'suspended'])
  @IsOptional()
  status?: string;
}

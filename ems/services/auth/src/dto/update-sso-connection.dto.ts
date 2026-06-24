import { IsBoolean, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSsoConnectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsIn(['oauth2', 'saml'])
  @IsOptional()
  provider?: 'oauth2' | 'saml';

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientSecret?: string;

  @IsString()
  @IsOptional()
  ssoUrl?: string;

  @IsString()
  @IsOptional()
  certificate?: string;

  @IsObject()
  @IsOptional()
  attributeMapping?: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

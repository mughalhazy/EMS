import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSsoConnectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['oauth2', 'saml'])
  provider: 'oauth2' | 'saml';

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsString()
  @IsNotEmpty()
  issuer: string;

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
}

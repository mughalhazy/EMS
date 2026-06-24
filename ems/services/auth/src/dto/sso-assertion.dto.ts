import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Normalized identity assertion produced by the OAuth2/SAML callback handler
 * after the upstream IdP token/response has been verified.
 */
export class SsoAssertionDto {
  @IsString()
  @IsNotEmpty()
  connectionId: string;

  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}

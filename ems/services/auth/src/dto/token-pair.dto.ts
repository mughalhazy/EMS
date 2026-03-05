import { AuthenticatedUser } from '../types/authenticated-user.type';

export class TokenPairDto {
  accessToken!: string;
  refreshToken!: string;
  accessTokenExpiresAt!: Date;
  refreshTokenExpiresAt!: Date;
  user!: AuthenticatedUser;
}

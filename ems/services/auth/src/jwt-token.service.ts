import { createHmac, randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

type TokenKind = 'access' | 'refresh';

type JwtPayload = {
  sub: string;
  tid: string;
  typ: TokenKind;
  jti: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtTokenService {
  private readonly issuer = 'ems-auth';
  private readonly accessTokenTtlSec = 60 * 15;
  private readonly refreshTokenTtlSec = 60 * 60 * 24 * 14;

  private readonly secret = process.env.JWT_SECRET ?? 'local-dev-secret-change-me';

  signAccessToken(userId: string, tenantId: string): { token: string; expiresAt: Date } {
    return this.signToken('access', userId, tenantId, this.accessTokenTtlSec);
  }

  signRefreshToken(userId: string, tenantId: string): { token: string; expiresAt: Date } {
    return this.signToken('refresh', userId, tenantId, this.refreshTokenTtlSec);
  }

  verify(token: string, expectedType: TokenKind): JwtPayload {
    const [headerRaw, payloadRaw, signature] = token.split('.');
    if (!headerRaw || !payloadRaw || !signature) {
      throw new Error('Malformed token');
    }

    const signingInput = `${headerRaw}.${payloadRaw}`;
    const expectedSignature = this.signInput(signingInput);
    if (expectedSignature !== signature) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(Buffer.from(payloadRaw, 'base64url').toString('utf-8')) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new Error('Token expired');
    }

    if (payload.typ !== expectedType) {
      throw new Error('Unexpected token type');
    }

    return payload;
  }

  hashToken(token: string): string {
    return createHmac('sha256', this.secret).update(token).digest('hex');
  }

  private signToken(
    type: TokenKind,
    userId: string,
    tenantId: string,
    ttlSeconds: number,
  ): { token: string; expiresAt: Date } {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSeconds;

    const headerRaw = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
      'base64url',
    );
    const payloadRaw = Buffer.from(
      JSON.stringify({
        sub: userId,
        tid: tenantId,
        typ: type,
        jti: randomUUID(),
        iss: this.issuer,
        iat: now,
        exp,
      }),
    ).toString('base64url');

    const signingInput = `${headerRaw}.${payloadRaw}`;
    const signature = this.signInput(signingInput);

    return {
      token: `${signingInput}.${signature}`,
      expiresAt: new Date(exp * 1000),
    };
  }

  private signInput(input: string): string {
    return createHmac('sha256', this.secret).update(input).digest('base64url');
  }
}

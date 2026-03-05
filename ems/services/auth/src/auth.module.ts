import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthCredentialEntity,
      AuthTokenEntity,
      AuthUserStateEntity,
    ]),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

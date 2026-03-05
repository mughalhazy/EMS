import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthFederatedIdentityEntity } from './entities/auth-federated-identity.entity';
import { AuthSsoProviderEntity } from './entities/auth-sso-provider.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';
import { UserEntity } from '../../user/src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthCredentialEntity,
      AuthTokenEntity,
      AuthUserStateEntity,
      AuthSsoProviderEntity,
      AuthFederatedIdentityEntity,
      UserEntity,
    ]),
  ],
  providers: [AuthService, TenantIsolationMiddleware],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantIsolationMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

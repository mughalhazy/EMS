import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationEntity } from './entities/organization.entity';
import { TenantSettingsEntity } from './entities/tenant-settings.entity';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from './entities/user.entity';
import { TenantIsolationMiddleware } from './middleware/tenant-isolation.middleware';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TenantEntity,
      OrganizationEntity,
      TenantSettingsEntity,
    ]),
  ],
  controllers: [UserController, TenantController, OrganizationController],
  providers: [UserService, TenantService, OrganizationService],
  exports: [UserService, TenantService, OrganizationService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantIsolationMiddleware).forRoutes(
      { path: 'api/v1/organizations', method: RequestMethod.ALL },
      { path: 'api/v1/organizations/(.*)', method: RequestMethod.ALL },
      { path: 'api/v1/tenants/:tenantId/settings', method: RequestMethod.ALL },
      { path: 'api/v1/tenants/:tenantId/users', method: RequestMethod.ALL },
      { path: 'api/v1/tenants/:tenantId/users/(.*)', method: RequestMethod.ALL },
    );
  }
}

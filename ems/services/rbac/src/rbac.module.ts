import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RbacService } from './rbac.service';
import { RbacController, UserRoleController } from './rbac.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, UserRole])],
  controllers: [RbacController, UserRoleController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}

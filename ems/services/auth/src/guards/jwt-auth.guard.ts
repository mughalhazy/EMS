import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';

import { JwtTokenService } from '../jwt-token.service';
import { RbacService } from '../rbac.service';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { UserEntity, UserStatus } from '../entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly rbacService: RbacService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let decoded: { sub: string; tid: string };
    try {
      decoded = this.jwtTokenService.verify(token, 'access');
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded.sub, tenantId: decoded.tid, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new UnauthorizedException('User is not active');
    }

    const routeTenantId = request.params?.tenantId as string | undefined;
    const headerTenantId = request.headers['x-tenant-id'];
    const scopedHeaderTenantId = Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId;

    if (routeTenantId && routeTenantId !== decoded.tid) {
      throw new UnauthorizedException('Token tenant does not match route tenant');
    }

    if (scopedHeaderTenantId && scopedHeaderTenantId !== decoded.tid) {
      throw new UnauthorizedException('Token tenant does not match tenant header');
    }

    const { roles, permissions } = await this.rbacService.getUserRbac(decoded.tid, decoded.sub);
    request.user = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roleNames: roles,
      permissions,
    };

    return true;
  }
}

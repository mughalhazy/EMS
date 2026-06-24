import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantContext {
  tenantId: string;
  userId: string;
  roles: string[];
}

export const TENANT_CONTEXT_KEY = 'tenantContext';

export const GetTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request[TENANT_CONTEXT_KEY];
  },
);

import { BadRequestException, ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { TenantContext } from '../tenant-context';

const TENANT_HEADER = 'x-tenant-id';

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    const headerValue = request.headers[TENANT_HEADER];
    const tenantId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!tenantId) {
      throw new BadRequestException(`${TENANT_HEADER} header is required`);
    }

    const tenantParam = request.params.tenantId;
    if (tenantParam && tenantParam !== tenantId) {
      throw new ForbiddenException('Tenant mismatch between route parameter and x-tenant-id header');
    }

    TenantContext.run(tenantId, next);
  }
}

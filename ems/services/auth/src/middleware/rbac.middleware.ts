import { NextFunction, Request, Response } from 'express';

import { AuthenticatedUser } from '../types/authenticated-user.type';

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

/**
 * Express middleware factory for RBAC checks on non-controller routes.
 *
 * Example:
 * app.get('/admin', rbacMiddleware('roles.manage'), handler)
 */
export const rbacMiddleware =
  (...requiredPermissions: string[]) =>
  (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    if (!requiredPermissions.length) {
      next();
      return;
    }

    const userPermissions = request.user?.permissions ?? [];
    const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      response.status(403).json({
        message: 'Insufficient permissions',
        requiredPermissions,
      });
      return;
    }

    next();
  };

export type AuthenticatedUser = {
  userId: string;
  tenantId: string;
  email: string;
  roleNames: string[];
  permissions: string[];
};

import { api } from './api'
import { Tenant, Organization, User, Role } from '@/types/domain'

export const tenantService = {
  getCurrent(): Promise<Tenant> {
    return api.get('/tenant')
  },

  listOrganizations(): Promise<Organization[]> {
    return api.get('/organizations')
  },

  listUsers(): Promise<User[]> {
    return api.get('/users')
  },

  listRoles(): Promise<Role[]> {
    return api.get('/roles')
  },

  inviteUser(payload: { email: string; roleId: string; organizationId?: string }): Promise<User> {
    return api.post('/users/invite', payload)
  },
}

import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { TenantStatus, UserStatus, EventStatus } from '@/types/domain'

export interface AdminTenant {
  id: string
  name: string
  slug: string
  status: TenantStatus
  eventCount: number
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  tenantId: string
  tenantName: string
  email: string
  firstName: string
  lastName: string
  status: UserStatus
  roles: string[]
  lastLoginAt?: string
  createdAt: string
}

export interface AdminEvent {
  id: string
  tenantId: string
  tenantName: string
  name: string
  code: string
  status: EventStatus
  startAt: string
  endAt: string
  attendeeCount: number
}

export type ServiceStatus = 'healthy' | 'degraded' | 'down'

export interface ServiceHealth {
  name: string
  status: ServiceStatus
  latencyMs: number
  uptimePercent: number
  lastCheckedAt: string
}

export interface SystemMetrics {
  requestsPerMinute: number
  errorRate: number
  p95LatencyMs: number
  activeSessions: number
  kafkaLag: number
  cacheHitRate: number
  services: ServiceHealth[]
  asOf: string
}

export const adminService = {
  // ── Tenants ──────────────────────────────────────────────────
  listTenants(params?: PaginationParams & { status?: TenantStatus }): Promise<PaginatedResponse<AdminTenant>> {
    return api.get('/admin/tenants', { ...paginationParams(params ?? {}), ...params })
  },

  suspendTenant(id: string): Promise<AdminTenant> {
    return api.post(`/admin/tenants/${id}/suspend`, {})
  },

  activateTenant(id: string): Promise<AdminTenant> {
    return api.post(`/admin/tenants/${id}/activate`, {})
  },

  // ── Users ─────────────────────────────────────────────────────
  listUsers(params?: PaginationParams & { status?: UserStatus; tenantId?: string }): Promise<PaginatedResponse<AdminUser>> {
    return api.get('/admin/users', { ...paginationParams(params ?? {}), ...params })
  },

  disableUser(id: string): Promise<AdminUser> {
    return api.post(`/admin/users/${id}/disable`, {})
  },

  enableUser(id: string): Promise<AdminUser> {
    return api.post(`/admin/users/${id}/enable`, {})
  },

  // ── Events ────────────────────────────────────────────────────
  listEvents(params?: PaginationParams & { status?: EventStatus; tenantId?: string }): Promise<PaginatedResponse<AdminEvent>> {
    return api.get('/admin/events', { ...paginationParams(params ?? {}), ...params })
  },

  // ── System ────────────────────────────────────────────────────
  systemHealth(): Promise<SystemMetrics> {
    return api.get('/admin/system/health')
  },
}

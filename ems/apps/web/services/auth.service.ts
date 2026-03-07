import { api } from './api'
import { User } from '@/types/domain'

export interface LoginPayload {
  email: string
  password: string
  tenantSlug: string
}

export interface LoginResponse {
  accessToken: string
  user: User
  expiresAt: string
}

export interface MeResponse {
  user: User
  permissions: string[]
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', payload)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ems_token', res.accessToken)
    }
    return res
  },

  async logout(): Promise<void> {
    await api.post<void>('/auth/logout', {})
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ems_token')
    }
  },

  async me(): Promise<MeResponse> {
    return api.get<MeResponse>('/auth/me')
  },

  async refreshToken(): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/refresh', {})
    if (typeof window !== 'undefined') {
      localStorage.setItem('ems_token', res.accessToken)
    }
    return res
  },

  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return api.patch('/auth/password', payload)
  },

  forgotPassword(email: string): Promise<void> {
    return api.post('/auth/forgot-password', { email })
  },

  resetPassword(payload: { token: string; newPassword: string }): Promise<void> {
    return api.post('/auth/reset-password', payload)
  },
}

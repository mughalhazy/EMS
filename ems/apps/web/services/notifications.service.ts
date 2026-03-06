import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Notification } from '@/types/domain'

export interface SendNotificationPayload {
  eventId?: string
  recipientUserIds?: string[]
  recipientAttendeeIds?: string[]
  channel: string
  templateKey: string
  subject?: string
  payloadJson: Record<string, unknown>
}

export const notificationsService = {
  list(params?: PaginationParams & { eventId?: string }): Promise<PaginatedResponse<Notification>> {
    return api.get('/notifications', { ...paginationParams(params ?? {}), ...params })
  },

  get(notificationId: string): Promise<Notification> {
    return api.get(`/notifications/${notificationId}`)
  },

  send(payload: SendNotificationPayload): Promise<Notification> {
    return api.post('/notifications', payload)
  },
}

import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Speaker } from '@/types/domain'

export const speakersService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Speaker>> {
    return api.get(`/events/${eventId}/speakers`, paginationParams(params ?? {}))
  },

  get(eventId: string, speakerId: string): Promise<Speaker> {
    return api.get(`/events/${eventId}/speakers/${speakerId}`)
  },

  create(eventId: string, payload: Partial<Speaker>): Promise<Speaker> {
    return api.post(`/events/${eventId}/speakers`, payload)
  },

  update(eventId: string, speakerId: string, payload: Partial<Speaker>): Promise<Speaker> {
    return api.patch(`/events/${eventId}/speakers/${speakerId}`, payload)
  },

  assignToSession(eventId: string, sessionId: string, speakerId: string): Promise<void> {
    return api.post(`/events/${eventId}/sessions/${sessionId}/speakers`, { speakerId })
  },

  removeFromSession(eventId: string, sessionId: string, speakerId: string): Promise<void> {
    return api.delete(`/events/${eventId}/sessions/${sessionId}/speakers/${speakerId}`)
  },
}

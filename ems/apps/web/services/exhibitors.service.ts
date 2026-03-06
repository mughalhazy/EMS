import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Exhibitor } from '@/types/domain'

export const exhibitorsService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Exhibitor>> {
    return api.get(`/events/${eventId}/exhibitors`, paginationParams(params ?? {}))
  },

  get(eventId: string, exhibitorId: string): Promise<Exhibitor> {
    return api.get(`/events/${eventId}/exhibitors/${exhibitorId}`)
  },

  create(eventId: string, payload: Partial<Exhibitor>): Promise<Exhibitor> {
    return api.post(`/events/${eventId}/exhibitors`, payload)
  },

  update(eventId: string, exhibitorId: string, payload: Partial<Exhibitor>): Promise<Exhibitor> {
    return api.patch(`/events/${eventId}/exhibitors/${exhibitorId}`, payload)
  },

  checkin(eventId: string, exhibitorId: string): Promise<Exhibitor> {
    return api.post(`/events/${eventId}/exhibitors/${exhibitorId}/checkin`, {})
  },
}

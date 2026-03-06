import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Sponsor } from '@/types/domain'

export const sponsorsService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Sponsor>> {
    return api.get(`/events/${eventId}/sponsors`, paginationParams(params ?? {}))
  },

  get(eventId: string, sponsorId: string): Promise<Sponsor> {
    return api.get(`/events/${eventId}/sponsors/${sponsorId}`)
  },

  create(eventId: string, payload: Partial<Sponsor>): Promise<Sponsor> {
    return api.post(`/events/${eventId}/sponsors`, payload)
  },

  update(eventId: string, sponsorId: string, payload: Partial<Sponsor>): Promise<Sponsor> {
    return api.patch(`/events/${eventId}/sponsors/${sponsorId}`, payload)
  },

  activate(eventId: string, sponsorId: string): Promise<Sponsor> {
    return api.post(`/events/${eventId}/sponsors/${sponsorId}/activate`, {})
  },
}

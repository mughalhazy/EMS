import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Ticket } from '@/types/domain'

export const ticketingService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Ticket>> {
    return api.get(`/events/${eventId}/tickets`, paginationParams(params ?? {}))
  },

  get(eventId: string, ticketId: string): Promise<Ticket> {
    return api.get(`/events/${eventId}/tickets/${ticketId}`)
  },

  create(eventId: string, payload: Partial<Ticket>): Promise<Ticket> {
    return api.post(`/events/${eventId}/tickets`, payload)
  },

  update(eventId: string, ticketId: string, payload: Partial<Ticket>): Promise<Ticket> {
    return api.patch(`/events/${eventId}/tickets/${ticketId}`, payload)
  },

  publish(eventId: string, ticketId: string): Promise<Ticket> {
    return api.post(`/events/${eventId}/tickets/${ticketId}/publish`, {})
  },

  close(eventId: string, ticketId: string): Promise<Ticket> {
    return api.post(`/events/${eventId}/tickets/${ticketId}/close`, {})
  },
}

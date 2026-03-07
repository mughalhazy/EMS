import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Ticket } from '@/types/domain'

export type CreateTicketPayload = Omit<Ticket, 'id' | 'tenantId' | 'eventId' | 'quantitySold' | 'status' | 'createdAt' | 'updatedAt'>
export type UpdateTicketPayload = Partial<CreateTicketPayload>

export interface TicketAvailability {
  ticketId: string
  quantityTotal: number
  quantitySold: number
  quantityAvailable: number
  status: Ticket['status']
}

export const ticketingService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Ticket>> {
    return api.get(`/events/${eventId}/tickets`, paginationParams(params ?? {}))
  },

  get(eventId: string, ticketId: string): Promise<Ticket> {
    return api.get(`/events/${eventId}/tickets/${ticketId}`)
  },

  create(eventId: string, payload: CreateTicketPayload): Promise<Ticket> {
    return api.post(`/events/${eventId}/tickets`, payload)
  },

  update(eventId: string, ticketId: string, payload: UpdateTicketPayload): Promise<Ticket> {
    return api.patch(`/events/${eventId}/tickets/${ticketId}`, payload)
  },

  remove(eventId: string, ticketId: string): Promise<void> {
    return api.delete(`/events/${eventId}/tickets/${ticketId}`)
  },

  availability(eventId: string, ticketId: string): Promise<TicketAvailability> {
    return api.get(`/events/${eventId}/tickets/${ticketId}/availability`)
  },

  publish(eventId: string, ticketId: string): Promise<Ticket> {
    return api.post(`/events/${eventId}/tickets/${ticketId}/publish`, {})
  },

  close(eventId: string, ticketId: string): Promise<Ticket> {
    return api.post(`/events/${eventId}/tickets/${ticketId}/close`, {})
  },
}

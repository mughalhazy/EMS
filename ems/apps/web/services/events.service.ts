import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Event, Venue, VenueType } from '@/types/domain'

export type CreateEventPayload = Omit<Event, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
export type UpdateEventPayload = Partial<CreateEventPayload>

export interface CreateVenuePayload {
  name: string
  type: VenueType
  addressLine1?: string
  city?: string
  country?: string
  virtualUrl?: string
  capacity?: number
}

export const eventsService = {
  list(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Event>> {
    return api.get('/events', { ...paginationParams(params ?? {}), ...params })
  },

  get(id: string): Promise<Event> {
    return api.get(`/events/${id}`)
  },

  create(payload: CreateEventPayload): Promise<Event> {
    return api.post('/events', payload)
  },

  update(id: string, payload: UpdateEventPayload): Promise<Event> {
    return api.patch(`/events/${id}`, payload)
  },

  remove(id: string): Promise<void> {
    return api.delete(`/events/${id}`)
  },

  publish(id: string): Promise<Event> {
    return api.post(`/events/${id}/publish`, {})
  },

  archive(id: string): Promise<Event> {
    return api.post(`/events/${id}/archive`, {})
  },

  // ── Venue sub-resource ───────────────────────────────────────
  listVenues(eventId: string): Promise<Venue[]> {
    return api.get(`/events/${eventId}/venues`)
  },

  createVenue(eventId: string, payload: CreateVenuePayload): Promise<Venue> {
    return api.post(`/events/${eventId}/venues`, payload)
  },
}

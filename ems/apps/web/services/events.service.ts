import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Event } from '@/types/domain'

export type CreateEventPayload = Omit<Event, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
export type UpdateEventPayload = Partial<CreateEventPayload>

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

  publish(id: string): Promise<Event> {
    return api.post(`/events/${id}/publish`, {})
  },

  archive(id: string): Promise<Event> {
    return api.post(`/events/${id}/archive`, {})
  },
}

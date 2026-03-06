import { api, paginationParams, PaginatedResponse, PaginationParams, generateIdempotencyKey } from './api'
import { Registration } from '@/types/domain'

export interface CreateRegistrationPayload {
  eventId: string
  attendeeId: string
  ticketId: string
}

export const registrationsService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Registration>> {
    return api.get(`/events/${eventId}/registrations`, paginationParams(params ?? {}))
  },

  get(eventId: string, registrationId: string): Promise<Registration> {
    return api.get(`/events/${eventId}/registrations/${registrationId}`)
  },

  create(payload: CreateRegistrationPayload): Promise<Registration> {
    return api.post('/registrations', payload, {
      requiresIdempotency: true,
      idempotencyKey: generateIdempotencyKey(),
    })
  },

  cancel(registrationId: string): Promise<Registration> {
    return api.post(`/registrations/${registrationId}/cancel`, {})
  },

  approve(registrationId: string): Promise<Registration> {
    return api.post(`/registrations/${registrationId}/approve`, {})
  },
}

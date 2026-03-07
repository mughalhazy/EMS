import { api, paginationParams, PaginatedResponse, PaginationParams, generateIdempotencyKey } from './api'
import { Registration, RegistrationStatus } from '@/types/domain'

export interface CreateRegistrationPayload {
  eventId: string
  attendeeId: string
  ticketId: string
}

export const registrationsService = {
  list(
    eventId: string,
    params?: PaginationParams & { status?: RegistrationStatus },
  ): Promise<PaginatedResponse<Registration>> {
    return api.get(`/events/${eventId}/registrations`, { ...paginationParams(params ?? {}), ...params })
  },

  get(eventId: string, registrationId: string): Promise<Registration> {
    return api.get(`/events/${eventId}/registrations/${registrationId}`)
  },

  // Idempotency-Key required per api-standards.md for registration POST
  create(payload: CreateRegistrationPayload, idempotencyKey?: string): Promise<Registration> {
    return api.post('/registrations', payload, {
      requiresIdempotency: true,
      idempotencyKey: idempotencyKey ?? generateIdempotencyKey(),
    })
  },

  // Status transitions: pending → approved → confirmed → cancelled
  approve(registrationId: string): Promise<Registration> {
    return api.post(`/registrations/${registrationId}/approve`, {})
  },

  confirm(registrationId: string): Promise<Registration> {
    return api.post(`/registrations/${registrationId}/confirm`, {})
  },

  cancel(registrationId: string): Promise<Registration> {
    return api.post(`/registrations/${registrationId}/cancel`, {})
  },

  checkin(registrationId: string): Promise<Registration> {
    return api.post(`/registrations/${registrationId}/checkin`, {})
  },
}

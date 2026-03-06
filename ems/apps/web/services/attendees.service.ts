import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Attendee } from '@/types/domain'

export const attendeesService = {
  list(eventId: string, params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Attendee>> {
    return api.get(`/events/${eventId}/attendees`, { ...paginationParams(params ?? {}), ...params })
  },

  get(eventId: string, attendeeId: string): Promise<Attendee> {
    return api.get(`/events/${eventId}/attendees/${attendeeId}`)
  },

  checkin(eventId: string, attendeeId: string): Promise<Attendee> {
    return api.post(`/events/${eventId}/attendees/${attendeeId}/checkin`, {})
  },

  export(eventId: string): Promise<Blob> {
    return api.get(`/events/${eventId}/attendees/export`)
  },
}

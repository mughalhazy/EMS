import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Attendee, AttendeeStatus } from '@/types/domain'

export type CreateAttendeePayload = Omit<Attendee, 'id' | 'tenantId' | 'eventId' | 'status' | 'createdAt' | 'updatedAt'>
export type UpdateAttendeePayload = Partial<Pick<Attendee, 'firstName' | 'lastName' | 'phone' | 'badgeName' | 'organizationId'>>

export const attendeesService = {
  list(
    eventId: string,
    params?: PaginationParams & { status?: AttendeeStatus },
  ): Promise<PaginatedResponse<Attendee>> {
    return api.get(`/events/${eventId}/attendees`, { ...paginationParams(params ?? {}), ...params })
  },

  get(eventId: string, attendeeId: string): Promise<Attendee> {
    return api.get(`/events/${eventId}/attendees/${attendeeId}`)
  },

  create(eventId: string, payload: CreateAttendeePayload): Promise<Attendee> {
    return api.post(`/events/${eventId}/attendees`, payload)
  },

  update(eventId: string, attendeeId: string, payload: UpdateAttendeePayload): Promise<Attendee> {
    return api.patch(`/events/${eventId}/attendees/${attendeeId}`, payload)
  },

  checkin(eventId: string, attendeeId: string): Promise<Attendee> {
    return api.post(`/events/${eventId}/attendees/${attendeeId}/checkin`, {})
  },

  export(eventId: string): Promise<Blob> {
    return api.get(`/events/${eventId}/attendees/export`)
  },
}

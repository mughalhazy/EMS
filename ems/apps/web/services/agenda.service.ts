import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Session, Room, Venue } from '@/types/domain'

export const agendaService = {
  // Sessions
  listSessions(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Session>> {
    return api.get(`/events/${eventId}/sessions`, paginationParams(params ?? {}))
  },

  getSession(eventId: string, sessionId: string): Promise<Session> {
    return api.get(`/events/${eventId}/sessions/${sessionId}`)
  },

  createSession(eventId: string, payload: Partial<Session>): Promise<Session> {
    return api.post(`/events/${eventId}/sessions`, payload)
  },

  updateSession(eventId: string, sessionId: string, payload: Partial<Session>): Promise<Session> {
    return api.patch(`/events/${eventId}/sessions/${sessionId}`, payload)
  },

  // Venues
  listVenues(eventId: string): Promise<Venue[]> {
    return api.get(`/events/${eventId}/venues`)
  },

  // Rooms
  listRooms(venueId: string): Promise<Room[]> {
    return api.get(`/venues/${venueId}/rooms`)
  },
}

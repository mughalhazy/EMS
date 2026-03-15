import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { Event, EventSettings, Room, Venue, VenueType } from '@/types/domain'

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

export interface CreateRoomPayload {
  name: string
  floor?: string
  capacity: number
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

export interface UpdateEventSettingsPayload {
  timezone?: string
  capacity?: number
  visibility?: 'private' | 'public' | 'unlisted'
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

  unpublish(id: string): Promise<Event> {
    return api.post(`/events/${id}/unpublish`, {})
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

  listRooms(eventId: string, venueId: string): Promise<Room[]> {
    return api.get(`/events/${eventId}/venues/${venueId}/rooms`)
  },

  createRoom(eventId: string, venueId: string, payload: CreateRoomPayload): Promise<Room> {
    return api.post(`/events/${eventId}/venues/${venueId}/rooms`, payload)
  },

  updateRoom(eventId: string, venueId: string, roomId: string, payload: UpdateRoomPayload): Promise<Room> {
    return api.patch(`/events/${eventId}/venues/${venueId}/rooms/${roomId}`, payload)
  },

  removeRoom(eventId: string, venueId: string, roomId: string): Promise<void> {
    return api.delete(`/events/${eventId}/venues/${venueId}/rooms/${roomId}`)
  },

  getSettings(eventId: string): Promise<EventSettings> {
    return api.get(`/events/${eventId}/settings`)
  },

  updateSettings(eventId: string, payload: UpdateEventSettingsPayload): Promise<EventSettings> {
    return api.patch(`/events/${eventId}/settings`, payload)
  },
}


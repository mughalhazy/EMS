import { api } from './api'

export interface EventKpis {
  totalRegistrations: number
  totalRevenue: number
  totalAttendees: number
  checkedInCount: number
  conversionRate: number
  avgOrderValue: number
}

export interface RevenueSummary {
  totalRevenue: number
  currency: string
  byTicketType: Array<{ ticketName: string; revenue: number; count: number }>
  byDay: Array<{ date: string; revenue: number }>
}

export interface AttendanceTrend {
  byDay: Array<{ date: string; registrations: number; checkins: number }>
}

export const analyticsService = {
  eventKpis(eventId: string): Promise<EventKpis> {
    return api.get(`/analytics/events/${eventId}/kpis`)
  },

  revenue(eventId: string): Promise<RevenueSummary> {
    return api.get(`/analytics/events/${eventId}/revenue`)
  },

  attendance(eventId: string): Promise<AttendanceTrend> {
    return api.get(`/analytics/events/${eventId}/attendance`)
  },

  sessionEngagement(eventId: string): Promise<Array<{ sessionId: string; title: string; capacity: number; checkins: number }>> {
    return api.get(`/analytics/events/${eventId}/sessions`)
  },
}

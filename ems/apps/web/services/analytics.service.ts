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

export interface FunnelMetrics {
  pageViews: number
  cartStarts: number
  checkoutStarts: number
  checkoutCompletions: number
  abandonmentRate: number
  conversionRate: number
  byStep: Array<{ step: string; count: number; dropOffRate: number }>
}

export interface TenantKpis {
  totalEvents: number
  activeEvents: number
  totalRevenue: number
  totalAttendees: number
  avgRevenuePerEvent: number
  currency: string
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

  // Funnel analytics and abandonment tracking (product.md: "Insights & Reporting")
  funnelMetrics(eventId: string): Promise<FunnelMetrics> {
    return api.get(`/analytics/events/${eventId}/funnel`)
  },

  // Portfolio-level KPIs for tenant dashboard
  tenantKpis(): Promise<TenantKpis> {
    return api.get('/analytics/kpis')
  },
}

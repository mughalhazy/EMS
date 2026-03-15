import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { AudienceSegment, Campaign } from '@/types/domain'

export interface CreateAudienceSegmentPayload {
  name: string
  description?: string
  criteriaJson: Record<string, unknown>
}

export interface CreateCampaignPayload {
  name: string
  description?: string
  audienceSegmentId: string
  channel: Campaign['channel']
  templateKey: string
  contentJson: Record<string, unknown>
}

export interface ScheduleCampaignPayload {
  scheduledAt: string
}

export interface RetargetCampaignPayload {
  audienceSegmentId: string
}

export const engagementService = {
  listCampaigns(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Campaign>> {
    return api.get(`/events/${eventId}/campaigns`, paginationParams(params ?? {}))
  },

  getCampaign(eventId: string, campaignId: string): Promise<Campaign> {
    return api.get(`/events/${eventId}/campaigns/${campaignId}`)
  },

  createCampaign(eventId: string, payload: CreateCampaignPayload): Promise<Campaign> {
    return api.post(`/events/${eventId}/campaigns`, payload)
  },

  scheduleCampaign(eventId: string, campaignId: string, payload: ScheduleCampaignPayload): Promise<Campaign> {
    return api.post(`/events/${eventId}/campaigns/${campaignId}/schedule`, payload)
  },

  retargetCampaign(eventId: string, campaignId: string, payload: RetargetCampaignPayload): Promise<Campaign> {
    return api.post(`/events/${eventId}/campaigns/${campaignId}/retarget`, payload)
  },

  listAudienceSegments(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<AudienceSegment>> {
    return api.get(`/events/${eventId}/audience-segments`, paginationParams(params ?? {}))
  },

  getAudienceSegment(eventId: string, audienceSegmentId: string): Promise<AudienceSegment> {
    return api.get(`/events/${eventId}/audience-segments/${audienceSegmentId}`)
  },

  createAudienceSegment(eventId: string, payload: CreateAudienceSegmentPayload): Promise<AudienceSegment> {
    return api.post(`/events/${eventId}/audience-segments`, payload)
  },
}

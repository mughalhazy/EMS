import { api, paginationParams, PaginatedResponse, PaginationParams } from './api'
import { TicketFulfillment } from '@/types/domain'

export const fulfillmentService = {
  list(registrationId: string, params?: PaginationParams): Promise<PaginatedResponse<TicketFulfillment>> {
    return api.get(`/registrations/${registrationId}/fulfillments`, paginationParams(params ?? {}))
  },

  get(fulfillmentId: string): Promise<TicketFulfillment> {
    return api.get(`/ticket-fulfillments/${fulfillmentId}`)
  },

  getArtifactUrl(fulfillmentId: string): Promise<{ url: string; expiresAt: string }> {
    return api.get(`/ticket-fulfillments/${fulfillmentId}/artifact`)
  },

  revoke(fulfillmentId: string): Promise<TicketFulfillment> {
    return api.post(`/ticket-fulfillments/${fulfillmentId}/revoke`, {})
  },
}

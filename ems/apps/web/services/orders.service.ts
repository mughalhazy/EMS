import { api, paginationParams, PaginatedResponse, PaginationParams, generateIdempotencyKey } from './api'
import { Order } from '@/types/domain'

export interface CreateOrderPayload {
  eventId: string
  buyerAttendeeId?: string
  currency: string
  lines: Array<{ ticketId: string; quantity: number }>
}

export const ordersService = {
  list(eventId: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    return api.get(`/events/${eventId}/orders`, paginationParams(params ?? {}))
  },

  get(orderId: string): Promise<Order> {
    return api.get(`/orders/${orderId}`)
  },

  create(payload: CreateOrderPayload): Promise<Order> {
    return api.post('/orders', payload, {
      requiresIdempotency: true,
      idempotencyKey: generateIdempotencyKey(),
    })
  },

  cancel(orderId: string): Promise<Order> {
    return api.post(`/orders/${orderId}/cancel`, {})
  },

  refund(orderId: string, amount?: number): Promise<Order> {
    return api.post(`/orders/${orderId}/refund`, { amount })
  },
}

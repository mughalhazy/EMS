import { api, paginationParams, PaginatedResponse, PaginationParams, generateIdempotencyKey } from './api'
import { Payment } from '@/types/domain'

export interface InitiatePaymentPayload {
  orderId: string
  provider: string
  amount: number
  currency: string
}

export const paymentsService = {
  list(orderId: string, params?: PaginationParams): Promise<PaginatedResponse<Payment>> {
    return api.get(`/orders/${orderId}/payments`, paginationParams(params ?? {}))
  },

  get(paymentId: string): Promise<Payment> {
    return api.get(`/payments/${paymentId}`)
  },

  initiate(payload: InitiatePaymentPayload): Promise<Payment> {
    return api.post('/payments', payload, {
      requiresIdempotency: true,
      idempotencyKey: generateIdempotencyKey(),
    })
  },

  capture(paymentId: string): Promise<Payment> {
    return api.post(`/payments/${paymentId}/capture`, {}, {
      requiresIdempotency: true,
      idempotencyKey: generateIdempotencyKey(),
    })
  },

  void(paymentId: string): Promise<Payment> {
    return api.post(`/payments/${paymentId}/void`, {})
  },
}

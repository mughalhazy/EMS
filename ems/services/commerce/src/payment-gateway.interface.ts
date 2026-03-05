import { PaymentStatus } from './entities/payment.entity';

export interface CreateStripeCompatiblePaymentInput {
  amountMinor: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface StripeCompatiblePaymentResult {
  providerReference: string;
  status: PaymentStatus;
}

export interface PaymentGateway {
  createPaymentIntent(input: CreateStripeCompatiblePaymentInput): Promise<StripeCompatiblePaymentResult>;
}

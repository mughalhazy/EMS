import { randomUUID } from 'crypto';
import { ConflictException, Injectable } from '@nestjs/common';

import {
  CreateStripeCompatiblePaymentInput,
  PaymentGateway,
  StripeCompatiblePaymentResult,
} from './payment-gateway.interface';
import { PaymentStatus } from './entities/payment.entity';

interface StripeCompatiblePaymentIntentResponse {
  id: string;
  status?: string;
}

@Injectable()
export class StripeCompatibleGateway implements PaymentGateway {
  private readonly baseUrl = process.env.STRIPE_COMPAT_BASE_URL;
  private readonly apiKey = process.env.STRIPE_COMPAT_API_KEY;

  async createPaymentIntent(
    input: CreateStripeCompatiblePaymentInput,
  ): Promise<StripeCompatiblePaymentResult> {
    if (!this.baseUrl || !this.apiKey) {
      return {
        providerReference: `pi_local_${randomUUID().replace(/-/g, '')}`,
        status: PaymentStatus.PENDING,
      };
    }

    const response = await fetch(`${this.baseUrl}/v1/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.toFormEncoded({
        amount: String(input.amountMinor),
        currency: input.currency.toLowerCase(),
        ...(input.metadata
          ? Object.fromEntries(
              Object.entries(input.metadata).map(([key, value]) => [
                `metadata[${key}]`,
                String(value),
              ]),
            )
          : {}),
      }),
    });

    if (!response.ok) {
      throw new ConflictException('Payment provider rejected the payment intent request.');
    }

    const data = (await response.json()) as StripeCompatiblePaymentIntentResponse;
    if (!data.id) {
      throw new ConflictException('Payment provider returned an invalid payment intent payload.');
    }

    return {
      providerReference: data.id,
      status: this.mapStripeStatus(data.status),
    };
  }

  private mapStripeStatus(status?: string): PaymentStatus {
    switch (status) {
      case 'requires_capture':
        return PaymentStatus.AUTHORIZED;
      case 'succeeded':
        return PaymentStatus.SUCCEEDED;
      case 'canceled':
        return PaymentStatus.CANCELED;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
      default:
        return PaymentStatus.PENDING;
    }
  }

  private toFormEncoded(data: Record<string, string>): string {
    return new URLSearchParams(data).toString();
  }
}

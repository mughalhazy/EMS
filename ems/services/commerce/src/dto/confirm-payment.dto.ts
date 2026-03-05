import { PaymentStatus } from '../entities/payment.entity';

export class ConfirmPaymentDto {
  providerReference!: string;
  status!: PaymentStatus;
}

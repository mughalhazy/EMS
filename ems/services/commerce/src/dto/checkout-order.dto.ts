export class CheckoutOrderDto {
  amountMinor!: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

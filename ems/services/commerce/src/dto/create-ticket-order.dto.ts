export class CreateTicketOrderItemDto {
  inventoryId!: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreateTicketOrderDto {
  items!: CreateTicketOrderItemDto[];
  currency?: string;
  discount?: number;
  tax?: number;
  metadata?: Record<string, unknown>;
}

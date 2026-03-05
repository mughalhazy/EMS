export class CreateTicketOrderAttendeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isTicketOwner?: boolean;
  answers?: CreateTicketOrderAttendeeAnswerDto[];
}

export class CreateTicketOrderAttendeeAnswerDto {
  questionId!: string;
  value!: string;
}

export class CreateTicketOrderItemDto {
  inventoryId!: string;
  quantity!: number;
  unitPrice!: number;
  attendees?: CreateTicketOrderAttendeeDto[];
}

export class CreateTicketOrderDto {
  items!: CreateTicketOrderItemDto[];
  currency?: string;
  discount?: number;
  tax?: number;
  metadata?: Record<string, unknown>;
}

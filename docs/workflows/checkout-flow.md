# Checkout Flow Workflow

This workflow describes ticket order creation, checkout, and payment confirmation.

## Preconditions

- A valid `tenantId` exists.
- Ticket inventory and pricing are configured.
- Caller sends an `Idempotency-Key` header for mutating requests.

## Steps

1. **Create order (reserve intent + pricing snapshot)**
   - API command:
     - `POST /api/v1/tenants/:tenantId/ticket-purchases/orders`
   - Purpose:
     - Validates attendees/required answers, resolves ticket pricing, and creates a draft order.
2. **Checkout order (create payment attempt)**
   - API command:
     - `POST /api/v1/tenants/:tenantId/ticket-purchases/orders/:orderId/checkout`
   - Purpose:
     - Starts payment flow for the order amount.
3. **Confirm payment status**
   - API command:
     - `POST /api/v1/tenants/:tenantId/ticket-purchases/payments/confirm`
   - Purpose:
     - Updates payment state based on processor callback or reconciliation.
4. **Registration handoff (on successful payment)**
   - System command:
     - `CreateRegistrationFromPaidOrder`
   - Purpose:
     - Creates and confirms attendee registrations tied to purchased tickets.

## Commands (Domain/API)

- `CreateTicketOrder`
- `CheckoutOrder`
- `ConfirmPayment`
- `CreateRegistrationFromOrderItem` (internal)

## Emitted Events

- Topic: `order.created`
  - Published when order is created.
- Topic: `payment.completed`
  - Published when payment reaches completed state.
- Downstream registration events (triggered by successful payment):
  - `registration.created`
  - `registration.confirmed`

## Primary Consumers

- Registration service
- Analytics and revenue reporting
- Support/order-detail read models

## Operational Notes

- `Idempotency-Key` is required for order creation, checkout, and payment confirm endpoints.
- Each order item must contain attendee entries that match quantity.
- Exactly one attendee per item must be marked as ticket owner.

# Checkout Flow Workflow

This workflow describes ticket order creation, checkout, payment confirmation, and registration handoff.

## Entities

- Tenant
- Order
- Payment
- Ticket
- Registration

## Owning Service

- Commerce Service

## Preconditions

- A valid `tenantId` exists.
- Ticket inventory and pricing are configured.
- Caller sends an `Idempotency-Key` header for mutating requests.

## Steps

1. **Create order**
   - API command: `POST /api/v1/tenants/{tenantId}/ticket-purchases/orders`
2. **Checkout order**
   - API command: `POST /api/v1/tenants/{tenantId}/ticket-purchases/orders/{orderId}/checkout`
3. **Confirm payment status**
   - API command: `POST /api/v1/tenants/{tenantId}/ticket-purchases/payments/confirm`
4. **Registration handoff on payment success**
   - System command: `CreateRegistrationFromPaidOrder`

## Commands (Domain/API)

- `CreateTicketOrder`
- `CheckoutOrder`
- `ConfirmPayment`
- `CreateRegistrationFromOrderItem` (internal)

## Emitted Events

- `OrderCreated`
- `PaymentAuthorized`
- `PaymentCaptured`
- `TicketIssued`
- `RegistrationSubmitted`
- `RegistrationConfirmed`

## Primary Consumers

- Registration Service
- Analytics Service
- Order detail/read-model consumers

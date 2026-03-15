# Checkout Flow Workflow

This workflow describes ticket order creation, payment confirmation, and registration handoff.

## Entities

- Tenant
- Order
- Payment
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
2. **Create/checkout payment for order**
   - API command: `POST /api/v1/tenants/{tenantId}/ticket-purchases/orders/{orderId}/payments`
3. **Confirm payment status**
   - API command: `POST /api/v1/tenants/{tenantId}/ticket-purchases/payments/confirmations`
4. **Registration handoff on payment success**
   - System command: `CreateRegistrationFromOrderItem`

## Commands (Domain/API)

- `CreateTicketOrder`
- `CheckoutOrder`
- `ConfirmPayment`
- `CreateRegistrationFromOrderItem` (internal)

## Emitted Events

- `OrderCreated` (`order.created`)
- `PaymentCaptured` (`payment.captured`)
- `OrderConfirmationEmailRequested` (`order.confirmation.email.requested`)
- `RegistrationStarted` (`registration.started`)
- `RegistrationConfirmed` (`registration.confirmed`)

## Primary Consumers

- Registration Service
- Analytics Service
- Order detail/read-model consumers

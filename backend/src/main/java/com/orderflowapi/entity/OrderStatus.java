package com.orderflowapi.entity;

/**
 * Possible states for an Order.
 *
 * The core fulfilment lifecycle is PENDING → CONFIRMED → PROCESSING → SHIPPED →
 * DELIVERED, with CANCELED reachable from any active state.  PAID and
 * PAYMENT_FAILED are driven by Stripe payment webhooks.
 */
public enum OrderStatus {
    PENDING,
    PAID,
    PAYMENT_FAILED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELED
}

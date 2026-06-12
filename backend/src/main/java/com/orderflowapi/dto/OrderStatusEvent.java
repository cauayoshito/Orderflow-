package com.orderflowapi.dto;

import java.time.Instant;

/**
 * Event broadcast over WebSocket (STOMP topic {@code /topic/orders/{id}})
 * whenever an order's status changes.
 */
public record OrderStatusEvent(Long orderId, String status, Instant updatedAt) {
}

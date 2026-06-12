package com.orderflowapi.controller;

import com.orderflowapi.dto.OrderStatusEvent;
import com.orderflowapi.entity.Order;
import com.orderflowapi.repository.OrderRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

/**
 * Handles STOMP subscriptions for order tracking.  When a client sends to
 * {@code /app/orders/track/{orderId}}, we reply on {@code /topic/orders/{orderId}}
 * with the current status so newly-connected clients get the latest state
 * immediately (subsequent changes are pushed by {@code OrderService}).
 */
@Controller
public class OrderWebSocketController {

    private final OrderRepository orderRepository;

    public OrderWebSocketController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @MessageMapping("/orders/track/{orderId}")
    @SendTo("/topic/orders/{orderId}")
    public OrderStatusEvent track(@DestinationVariable Long orderId) {
        String status = orderRepository.findById(orderId)
                .map(Order::getStatus)
                .map(Enum::name)
                .orElse("UNKNOWN");
        return new OrderStatusEvent(orderId, status, Instant.now());
    }
}

package com.orderflowapi.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request to create a Stripe PaymentIntent for an existing order.
 */
public class CreatePaymentIntentRequest {

    @NotNull
    private Long orderId;

    public CreatePaymentIntentRequest() {
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}

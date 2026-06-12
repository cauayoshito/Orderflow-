package com.orderflowapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for updating the status of an existing order.  The status
 * property is provided as a string and mapped to the {@link
 * com.orderflowapi.entity.OrderStatus} enum by the service layer.  It must
 * not be null or empty.
 */
public class OrderStatusUpdateRequest {

    @NotNull
    @NotBlank
    private String status;

    public OrderStatusUpdateRequest() {
    }

    public OrderStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

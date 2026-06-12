package com.orderflowapi.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO containing all details of an order.  In addition to the order
 * metadata, it includes customer information, a list of ordered items, and
 * the total value of the order.  The status is conveyed as a string to
 * decouple clients from internal enum types.
 */
public class OrderResponse {

    private Long id;
    private LocalDateTime orderDate;
    private String status;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private List<OrderItemResponse> items;
    private Double total;

    public OrderResponse() {
    }

    public OrderResponse(Long id, LocalDateTime orderDate, String status,
                         Long customerId, String customerName, String customerEmail,
                         List<OrderItemResponse> items, Double total) {
        this.id = id;
        this.orderDate = orderDate;
        this.status = status;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.items = items;
        this.total = total;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }
}

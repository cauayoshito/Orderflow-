package com.orderflowapi.controller;

import com.orderflowapi.dto.*;
import com.orderflowapi.entity.OrderStatus;
import com.orderflowapi.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing operations for managing orders.  Separate endpoints
 * are provided for customers (to create and view their own orders) and
 * administrators (to view and update the status of any order).  Access to
 * these endpoints is restricted by path patterns configured in
 * {@link com.orderflowapi.security.SecurityConfig}.
 */
@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Place a new order.  Accessible to clients with CLIENTE or ADMIN roles.
     *
     * @param request order details including customer id and items
     * @return the created order
     */
    @PostMapping("/customer/orders")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse created = orderService.createOrder(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Retrieve a single order by id.  Accessible to clients with CLIENTE or
     * ADMIN roles.
     *
     * @param id order identifier
     * @return the order
     */
    @GetMapping("/customer/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * Retrieve all orders for a given customer.  Accessible to clients with
     * CLIENTE or ADMIN roles.  Administrators can pass any customer id,
     * whereas customers should pass their own customer id to view their
     * history.
     *
     * @param customerId the customer identifier
     * @return list of orders for the customer
     */
    @GetMapping("/customer/orders/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
        List<OrderResponse> orders = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(orders);
    }

    /**
     * List all orders in the system.  Accessible only to ADMIN role.
     *
     * @return list of all orders
     */
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Update the status of an order.  Accessible only to ADMIN role.  The
     * request body must contain a valid status string that maps to the
     * {@link OrderStatus} enum.  Invalid transitions will result in an
     * IllegalStateException.
     *
     * @param id      the order id
     * @param request the desired new status
     * @return the updated order
     */
    @PatchMapping("/admin/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                           @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid order status: " + request.getStatus());
        }
        OrderResponse updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}

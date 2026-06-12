package com.orderflowapi.repository;

import com.orderflowapi.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for OrderItem entities.  CRUD operations are sufficient for
 * interacting with order items.
 */
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
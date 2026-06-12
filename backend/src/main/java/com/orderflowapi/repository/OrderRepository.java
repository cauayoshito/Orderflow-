package com.orderflowapi.repository;

import com.orderflowapi.entity.Order;
import com.orderflowapi.entity.Customer;
import com.orderflowapi.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Order entities.  Provides finders for a customer's orders,
 * recent orders and date-bounded queries used by the dashboard and AI
 * summaries.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomer(Customer customer);

    /** Most recent orders first, capped by the {@code Pageable}/top-N keyword. */
    List<Order> findTop10ByOrderByOrderDateDesc();

    /** Orders placed on or after the given timestamp (e.g. weekly summary). */
    List<Order> findByOrderDateAfter(LocalDateTime since);

    long countByStatus(OrderStatus status);
}

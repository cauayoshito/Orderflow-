package com.orderflowapi.repository;

import com.orderflowapi.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for Customer entities.  Supports finding a customer by email, which
 * is unique.
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
}
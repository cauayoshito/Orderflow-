package com.orderflowapi.repository;

import com.orderflowapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for managing User entities.  Extending JpaRepository provides
 * CRUD operations out of the box.  The custom methods allow looking up a
 * user by username and checking for existence, both of which are commonly
 * needed during authentication flows.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
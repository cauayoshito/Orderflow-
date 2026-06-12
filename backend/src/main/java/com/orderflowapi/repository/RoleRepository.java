package com.orderflowapi.repository;

import com.orderflowapi.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for the Role entity.  Provides CRUD and finder methods to
 * retrieve roles by their unique name.
 */
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
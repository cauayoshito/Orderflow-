package com.orderflowapi.service;

import com.orderflowapi.dto.RegisterRequest;
import com.orderflowapi.entity.Customer;
import com.orderflowapi.entity.Role;
import com.orderflowapi.entity.User;
import com.orderflowapi.repository.CustomerRepository;
import com.orderflowapi.repository.RoleRepository;
import com.orderflowapi.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Service containing business logic for creating new users.  It validates that
 * usernames and emails are unique, encrypts passwords, assigns roles and — for
 * customers — provisions a linked {@link Customer} profile so the account can
 * place and track orders out of the box.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Determine roles to assign (defaults to CLIENTE)
        String requestedRole = Optional.ofNullable(request.getRole())
                .filter(r -> !r.isBlank())
                .orElse("CLIENTE")
                .toUpperCase();
        Role role = roleRepository.findByName("ROLE_" + requestedRole)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + requestedRole));
        Set<Role> roles = new HashSet<>();
        roles.add(role);

        // Create user entity
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);

        // Provision a customer profile for shoppers so checkout works immediately
        if ("CLIENTE".equals(requestedRole)) {
            Customer customer = new Customer();
            customer.setName(request.getUsername());
            customer.setEmail(request.getEmail());
            customer = customerRepository.save(customer);
            user.setCustomer(customer);
        }

        return userRepository.save(user);
    }
}

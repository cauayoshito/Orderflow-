package com.orderflowapi.controller;

import com.orderflowapi.dto.UserProfileResponse;
import com.orderflowapi.entity.Role;
import com.orderflowapi.entity.User;
import com.orderflowapi.exception.ResourceNotFoundException;
import com.orderflowapi.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Exposes the authenticated user's own profile.  Available to any logged-in
 * user (CLIENTE or ADMIN) under the {@code /api/customer} namespace.
 */
@RestController
@RequestMapping("/api/customer")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        Long customerId = user.getCustomer() != null ? user.getCustomer().getId() : null;
        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(), user.getUsername(), user.getEmail(), roles, customerId));
    }
}

package com.orderflowapi.dto;

import java.util.List;

/**
 * Profile of the currently authenticated user, returned by {@code
 * GET /api/customer/me}.  The frontend uses {@code customerId} to scope the
 * cart, checkout and "my orders" views.
 */
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private Long customerId;

    public UserProfileResponse(Long id, String username, String email, List<String> roles, Long customerId) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.customerId = customerId;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public Long getCustomerId() {
        return customerId;
    }
}

package com.orderflowapi.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for login.  Requires non‑blank username and password fields.
 */
public class AuthRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;

    public AuthRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
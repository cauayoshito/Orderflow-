package com.orderflowapi.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload used when exchanging a refresh token for a new access
 * token.  The refresh token field is required.
 */
public class RefreshTokenRequest {
    @NotBlank
    private String refreshToken;

    public RefreshTokenRequest() {
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
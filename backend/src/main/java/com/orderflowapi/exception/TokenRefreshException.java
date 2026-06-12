package com.orderflowapi.exception;

/**
 * Custom exception thrown when a refresh token is no longer valid.  Controllers
 * can catch this exception and translate it into an appropriate HTTP error
 * response.
 */
public class TokenRefreshException extends RuntimeException {
    private final String token;

    public TokenRefreshException(String token, String message) {
        super(message);
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}
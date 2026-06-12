package com.orderflowapi.exception;

/**
 * Exception thrown when an entity could not be found.  Controllers can catch
 * this exception and return an appropriate 404 error response.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
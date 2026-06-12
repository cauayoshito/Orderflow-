package com.orderflowapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the OrderFlow API application.  This class boots a Spring
 * application using the Spring Boot auto–configuration.  The @SpringBootApplication
 * annotation triggers component scanning, autoconfiguration of the JPA layer and
 * web environment, and registers the default Spring context.
 */
@SpringBootApplication
public class OrderFlowApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderFlowApiApplication.class, args);
    }
}
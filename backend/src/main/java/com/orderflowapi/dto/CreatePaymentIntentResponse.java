package com.orderflowapi.dto;

/**
 * Response for a created PaymentIntent: the client secret the browser uses to
 * confirm the payment, and the publishable key to initialise Stripe.js.
 */
public class CreatePaymentIntentResponse {

    private String clientSecret;
    private String publishableKey;

    public CreatePaymentIntentResponse(String clientSecret, String publishableKey) {
        this.clientSecret = clientSecret;
        this.publishableKey = publishableKey;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getPublishableKey() {
        return publishableKey;
    }
}

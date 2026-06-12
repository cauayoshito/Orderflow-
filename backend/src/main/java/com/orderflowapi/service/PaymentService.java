package com.orderflowapi.service;

import com.orderflowapi.config.StripeProperties;
import com.orderflowapi.dto.CreatePaymentIntentResponse;
import com.orderflowapi.dto.OrderResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

/**
 * Wraps Stripe PaymentIntent creation for an order.  The order total is read
 * from {@link OrderService} (price snapshot at order time) and converted to the
 * smallest currency unit (centavos).  The order id is stored in PaymentIntent
 * metadata so the webhook can reconcile the payment back to the order.
 */
@Service
public class PaymentService {

    private static final String CURRENCY = "brl";

    private final OrderService orderService;
    private final StripeProperties stripeProperties;

    public PaymentService(OrderService orderService, StripeProperties stripeProperties) {
        this.orderService = orderService;
        this.stripeProperties = stripeProperties;
    }

    public CreatePaymentIntentResponse createPaymentIntent(Long orderId) {
        if (!StringUtils.hasText(stripeProperties.getSecretKey())) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Payments are disabled: set STRIPE_SECRET_KEY to enable them.");
        }

        // Throws ResourceNotFoundException (404) if the order doesn't exist.
        OrderResponse order = orderService.getOrderById(orderId);
        long amountInCents = Math.round(order.getTotal() * 100);

        Stripe.apiKey = stripeProperties.getSecretKey();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(CURRENCY)
                .putMetadata("orderId", String.valueOf(orderId))
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .build();

        try {
            PaymentIntent intent = PaymentIntent.create(params);
            return new CreatePaymentIntentResponse(intent.getClientSecret(), stripeProperties.getPublishableKey());
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to create payment: " + e.getMessage());
        }
    }
}

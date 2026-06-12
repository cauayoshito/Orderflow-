package com.orderflowapi.controller;

import com.orderflowapi.config.StripeProperties;
import com.orderflowapi.dto.CreatePaymentIntentRequest;
import com.orderflowapi.dto.CreatePaymentIntentResponse;
import com.orderflowapi.entity.OrderStatus;
import com.orderflowapi.exception.ResourceNotFoundException;
import com.orderflowapi.service.OrderService;
import com.orderflowapi.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Stripe payment endpoints.
 *
 * <ul>
 *   <li>{@code POST /api/payment/create-intent} (authenticated): creates a
 *       PaymentIntent for an order and returns the client secret.</li>
 *   <li>{@code POST /api/payment/webhook} (public — see SecurityConfig): receives
 *       Stripe events with the raw body, verifies the signature and updates the
 *       order status to PAID / PAYMENT_FAILED.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final StripeProperties stripeProperties;

    public PaymentController(PaymentService paymentService, OrderService orderService,
                            StripeProperties stripeProperties) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.stripeProperties = stripeProperties;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<CreatePaymentIntentResponse> createIntent(
            @Valid @RequestBody CreatePaymentIntentRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request.getOrderId()));
    }

    /**
     * Stripe webhook.  The raw request body (as a String) and the
     * {@code Stripe-Signature} header are required to verify the event.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                          @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        if (sigHeader == null) {
            return ResponseEntity.badRequest().body("Missing Stripe-Signature header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature verification failed");
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> updateOrderStatus(event, OrderStatus.PAID);
            case "payment_intent.payment_failed" -> updateOrderStatus(event, OrderStatus.PAYMENT_FAILED);
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }

        return ResponseEntity.ok("");
    }

    private void updateOrderStatus(Event event, OrderStatus status) {
        Optional<StripeObject> object = event.getDataObjectDeserializer().getObject();
        if (object.isEmpty() || !(object.get() instanceof PaymentIntent intent)) {
            log.warn("Stripe event {} had no deserializable PaymentIntent", event.getId());
            return;
        }
        String orderId = intent.getMetadata() != null ? intent.getMetadata().get("orderId") : null;
        if (orderId == null) {
            log.warn("PaymentIntent {} has no orderId metadata", intent.getId());
            return;
        }
        try {
            orderService.setPaymentStatus(Long.valueOf(orderId), status);
            log.info("Order {} marked {}", orderId, status);
        } catch (ResourceNotFoundException | NumberFormatException e) {
            log.warn("Could not apply payment status to order '{}': {}", orderId, e.getMessage());
        }
    }
}

package com.orderflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflowapi.dto.CreatePaymentIntentRequest;
import com.orderflowapi.dto.CreatePaymentIntentResponse;
import com.orderflowapi.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for {@link PaymentController}.  The Stripe API call is mocked via a
 * {@link PaymentService} mock; webhook signature verification runs for real
 * against an invalid signature.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void createIntent_validOrder_returnsClientSecret() throws Exception {
        when(paymentService.createPaymentIntent(anyLong()))
                .thenReturn(new CreatePaymentIntentResponse("cs_test_123_secret", "pk_test_dummy"));

        CreatePaymentIntentRequest request = new CreatePaymentIntentRequest();
        request.setOrderId(1L);

        mockMvc.perform(post("/api/payment/create-intent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSecret", is(notNullValue())))
                .andExpect(jsonPath("$.clientSecret", is("cs_test_123_secret")))
                .andExpect(jsonPath("$.publishableKey", is("pk_test_dummy")));
    }

    @Test
    void webhook_invalidSignature_returnsBadRequest() throws Exception {
        String payload = "{\"id\":\"evt_test\",\"type\":\"payment_intent.succeeded\"}";

        mockMvc.perform(post("/api/payment/webhook")
                        .header("Stripe-Signature", "t=12345,v1=deadbeefdeadbeef")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}

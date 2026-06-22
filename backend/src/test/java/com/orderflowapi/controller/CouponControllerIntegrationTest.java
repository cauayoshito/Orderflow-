package com.orderflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflowapi.dto.CouponRequest;
import com.orderflowapi.entity.Coupon;
import com.orderflowapi.entity.CouponType;
import com.orderflowapi.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link CouponController}: admin management and public
 * validation with discount computation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CouponControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CouponRepository couponRepository;

    @BeforeEach
    void setUp() {
        couponRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createCoupon_asAdmin_persists() throws Exception {
        CouponRequest req = new CouponRequest();
        req.setCode("promo20");
        req.setType(CouponType.PERCENT);
        req.setValue(20.0);

        mockMvc.perform(post("/api/admin/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is("PROMO20")))
                .andExpect(jsonPath("$.type", is("PERCENT")));

        assertEquals(1, couponRepository.count());
    }

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void createCoupon_asClient_forbidden() throws Exception {
        CouponRequest req = new CouponRequest();
        req.setCode("NOPE");
        req.setType(CouponType.FIXED);
        req.setValue(5.0);

        mockMvc.perform(post("/api/admin/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void validate_percentCoupon_isPublicAndComputesDiscount() throws Exception {
        Coupon c = new Coupon();
        c.setCode("SAVE10");
        c.setType(CouponType.PERCENT);
        c.setValue(10.0);
        c.setActive(true);
        couponRepository.save(c);

        mockMvc.perform(get("/api/public/coupons/validate")
                        .param("code", "save10")
                        .param("amount", "200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.discount", is(20.0)))
                .andExpect(jsonPath("$.finalAmount", is(180.0)));
    }

    @Test
    void validate_unknownCoupon_returnsInvalid() throws Exception {
        mockMvc.perform(get("/api/public/coupons/validate")
                        .param("code", "GHOST")
                        .param("amount", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.message", not(emptyOrNullString())));
    }

    @Test
    void validate_belowMinimum_returnsInvalid() throws Exception {
        Coupon c = new Coupon();
        c.setCode("MIN100");
        c.setType(CouponType.FIXED);
        c.setValue(15.0);
        c.setActive(true);
        c.setMinOrderAmount(100.0);
        couponRepository.save(c);

        mockMvc.perform(get("/api/public/coupons/validate")
                        .param("code", "MIN100")
                        .param("amount", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)));
    }
}

package com.orderflowapi.service;

import com.orderflowapi.dto.CouponRequest;
import com.orderflowapi.dto.CouponValidationResponse;
import com.orderflowapi.entity.Coupon;
import com.orderflowapi.entity.CouponType;
import com.orderflowapi.exception.ResourceNotFoundException;
import com.orderflowapi.repository.CouponRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Manages discount coupons / promotions and validates them against an order
 * amount.  Validation is deliberately read-only — redemption counting happens
 * when an order actually applies the coupon (see {@link #redeem}).
 */
@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional
    public Coupon create(CouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + code);
        }
        if (request.getType() == CouponType.PERCENT && request.getValue() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Percentage discount cannot exceed 100.");
        }
        Coupon c = new Coupon();
        c.setCode(code);
        c.setType(request.getType());
        c.setValue(request.getValue());
        c.setActive(request.getActive() == null || request.getActive());
        c.setMinOrderAmount(request.getMinOrderAmount());
        c.setMaxRedemptions(request.getMaxRedemptions());
        c.setExpiresAt(request.getExpiresAt());
        return couponRepository.save(c);
    }

    @Transactional(readOnly = true)
    public List<Coupon> listAll() {
        return couponRepository.findAll();
    }

    @Transactional
    public void delete(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id " + id));
        couponRepository.delete(c);
    }

    /**
     * Validate a coupon against an order amount and compute the discount.
     * Never throws for an unknown/invalid coupon — returns an invalid result so
     * the storefront can show a friendly message.
     */
    @Transactional(readOnly = true)
    public CouponValidationResponse validate(String rawCode, double amount) {
        if (rawCode == null || rawCode.isBlank()) {
            return CouponValidationResponse.invalid(rawCode, "Informe um cupom.");
        }
        String code = rawCode.trim().toUpperCase();
        Coupon c = couponRepository.findByCodeIgnoreCase(code).orElse(null);
        if (c == null) {
            return CouponValidationResponse.invalid(code, "Cupom não encontrado.");
        }
        if (!c.isActive()) {
            return CouponValidationResponse.invalid(code, "Cupom inativo.");
        }
        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(LocalDateTime.now())) {
            return CouponValidationResponse.invalid(code, "Cupom expirado.");
        }
        if (c.getMaxRedemptions() != null && c.getTimesRedeemed() >= c.getMaxRedemptions()) {
            return CouponValidationResponse.invalid(code, "Cupom esgotado.");
        }
        if (c.getMinOrderAmount() != null && amount < c.getMinOrderAmount()) {
            return CouponValidationResponse.invalid(code,
                    String.format("Pedido mínimo de R$ %.2f para usar este cupom.", c.getMinOrderAmount()));
        }

        double discount = computeDiscount(c, amount);
        double finalAmount = Math.max(0.0, round(amount - discount));
        return new CouponValidationResponse(true, code, round(discount), finalAmount, "Cupom aplicado!");
    }

    /**
     * Atomically record a redemption after an order successfully uses a coupon.
     */
    @Transactional
    public void redeem(String code) {
        couponRepository.findByCodeIgnoreCase(code).ifPresent(c -> {
            c.setTimesRedeemed(c.getTimesRedeemed() + 1);
            couponRepository.save(c);
        });
    }

    private double computeDiscount(Coupon c, double amount) {
        if (c.getType() == CouponType.PERCENT) {
            return round(amount * (c.getValue() / 100.0));
        }
        return round(Math.min(c.getValue(), amount));
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

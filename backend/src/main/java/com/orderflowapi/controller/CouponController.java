package com.orderflowapi.controller;

import com.orderflowapi.dto.CouponRequest;
import com.orderflowapi.dto.CouponResponse;
import com.orderflowapi.dto.CouponValidationResponse;
import com.orderflowapi.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Discount coupons / promotions.
 *
 * Validation is public ({@code /api/public/coupons/validate}) so the storefront
 * checkout can check a code; management is admin-only
 * ({@code /api/admin/coupons}).
 */
@RestController
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /** Public: validate a coupon against an order amount. */
    @GetMapping("/api/public/coupons/validate")
    public ResponseEntity<CouponValidationResponse> validate(
            @RequestParam String code,
            @RequestParam(defaultValue = "0") double amount) {
        return ResponseEntity.ok(couponService.validate(code, amount));
    }

    /** Admin: create a coupon. */
    @PostMapping("/api/admin/coupons")
    public ResponseEntity<CouponResponse> create(@Valid @RequestBody CouponRequest request) {
        return new ResponseEntity<>(new CouponResponse(couponService.create(request)), HttpStatus.CREATED);
    }

    /** Admin: list all coupons. */
    @GetMapping("/api/admin/coupons")
    public ResponseEntity<List<CouponResponse>> list() {
        List<CouponResponse> coupons = couponService.listAll().stream()
                .map(CouponResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(coupons);
    }

    /** Admin: delete a coupon. */
    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

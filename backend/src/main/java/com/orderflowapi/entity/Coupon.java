package com.orderflowapi.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * A discount coupon / promotion used to drive conversion and average order
 * value.  Supports percentage or fixed discounts, an optional minimum order
 * amount, an optional expiry and an optional redemption cap.
 */
@Entity
@Table(name = "coupons", indexes = {
        @Index(name = "idx_coupons_code", columnList = "code")
})
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    /** Percentage (0-100) when type=PERCENT, or BRL amount when type=FIXED. */
    @Column(name = "discount_value", nullable = false)
    private Double value;

    @Column(nullable = false)
    private boolean active = true;

    /** Minimum order amount required to use the coupon (optional). */
    private Double minOrderAmount;

    /** Maximum number of redemptions allowed (optional = unlimited). */
    private Integer maxRedemptions;

    @Column(nullable = false)
    private int timesRedeemed = 0;

    /** Expiry timestamp (optional = never expires). */
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Coupon() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public CouponType getType() {
        return type;
    }

    public void setType(CouponType type) {
        this.type = type;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Double getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(Double minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public Integer getMaxRedemptions() {
        return maxRedemptions;
    }

    public void setMaxRedemptions(Integer maxRedemptions) {
        this.maxRedemptions = maxRedemptions;
    }

    public int getTimesRedeemed() {
        return timesRedeemed;
    }

    public void setTimesRedeemed(int timesRedeemed) {
        this.timesRedeemed = timesRedeemed;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

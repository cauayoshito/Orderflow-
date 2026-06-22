package com.orderflowapi.dto;

import com.orderflowapi.entity.Coupon;

import java.time.LocalDateTime;

/**
 * Coupon view returned to the admin UI.
 */
public class CouponResponse {

    private Long id;
    private String code;
    private String type;
    private Double value;
    private boolean active;
    private Double minOrderAmount;
    private Integer maxRedemptions;
    private int timesRedeemed;
    private LocalDateTime expiresAt;

    public CouponResponse(Coupon c) {
        this.id = c.getId();
        this.code = c.getCode();
        this.type = c.getType().name();
        this.value = c.getValue();
        this.active = c.isActive();
        this.minOrderAmount = c.getMinOrderAmount();
        this.maxRedemptions = c.getMaxRedemptions();
        this.timesRedeemed = c.getTimesRedeemed();
        this.expiresAt = c.getExpiresAt();
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getType() {
        return type;
    }

    public Double getValue() {
        return value;
    }

    public boolean isActive() {
        return active;
    }

    public Double getMinOrderAmount() {
        return minOrderAmount;
    }

    public Integer getMaxRedemptions() {
        return maxRedemptions;
    }

    public int getTimesRedeemed() {
        return timesRedeemed;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}

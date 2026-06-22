package com.orderflowapi.entity;

/**
 * Discount type for a {@link Coupon}: a percentage off the order, or a fixed
 * amount (in BRL) off.
 */
public enum CouponType {
    PERCENT,
    FIXED
}

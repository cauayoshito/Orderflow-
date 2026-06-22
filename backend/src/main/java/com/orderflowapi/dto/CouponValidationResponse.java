package com.orderflowapi.dto;

/**
 * Result of validating a coupon against an order amount (public endpoint).
 */
public class CouponValidationResponse {

    private boolean valid;
    private String code;
    private double discount;       // computed discount in BRL
    private double finalAmount;    // amount after discount
    private String message;

    public CouponValidationResponse(boolean valid, String code, double discount,
                                    double finalAmount, String message) {
        this.valid = valid;
        this.code = code;
        this.discount = discount;
        this.finalAmount = finalAmount;
        this.message = message;
    }

    public static CouponValidationResponse invalid(String code, String message) {
        return new CouponValidationResponse(false, code, 0.0, 0.0, message);
    }

    public boolean isValid() {
        return valid;
    }

    public String getCode() {
        return code;
    }

    public double getDiscount() {
        return discount;
    }

    public double getFinalAmount() {
        return finalAmount;
    }

    public String getMessage() {
        return message;
    }
}

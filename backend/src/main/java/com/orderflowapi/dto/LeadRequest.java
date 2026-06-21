package com.orderflowapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Payload to capture a new marketing lead (public endpoint).
 */
public class LeadRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone;

    /** Channel that produced the lead: "landing", "pricing", "demo", "referral". */
    private String source;

    /** Plan the lead is interested in (optional). */
    private String planInterest;

    /** Referral code of whoever referred this lead (optional). */
    private String referredByCode;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getPlanInterest() {
        return planInterest;
    }

    public void setPlanInterest(String planInterest) {
        this.planInterest = planInterest;
    }

    public String getReferredByCode() {
        return referredByCode;
    }

    public void setReferredByCode(String referredByCode) {
        this.referredByCode = referredByCode;
    }
}

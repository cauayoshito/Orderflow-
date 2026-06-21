package com.orderflowapi.dto;

import com.orderflowapi.entity.Lead;

import java.time.LocalDateTime;

/**
 * Lead view returned to clients.  Includes the generated {@code referralCode}
 * so the capture UI can immediately show the lead its "indique e ganhe" link.
 */
public class LeadResponse {

    private Long id;
    private String name;
    private String email;
    private String source;
    private String planInterest;
    private String referralCode;
    private String referredByCode;
    private String status;
    private LocalDateTime createdAt;

    public LeadResponse(Lead lead) {
        this.id = lead.getId();
        this.name = lead.getName();
        this.email = lead.getEmail();
        this.source = lead.getSource();
        this.planInterest = lead.getPlanInterest();
        this.referralCode = lead.getReferralCode();
        this.referredByCode = lead.getReferredByCode();
        this.status = lead.getStatus().name();
        this.createdAt = lead.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getSource() {
        return source;
    }

    public String getPlanInterest() {
        return planInterest;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public String getReferredByCode() {
        return referredByCode;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

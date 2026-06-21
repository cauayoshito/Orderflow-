package com.orderflowapi.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * A marketing lead captured by the growth funnel: landing pages, the free-trial
 * CTA, lead-magnet forms and the referral program ("indique e ganhe").
 *
 * Each lead gets a unique {@code referralCode} it can share; when another lead
 * signs up using that code it is stored in {@code referredByCode}, which powers
 * the referral/affiliate tracking and the growth metrics.
 */
@Entity
@Table(name = "leads", indexes = {
        @Index(name = "idx_leads_email", columnList = "email"),
        @Index(name = "idx_leads_source", columnList = "source"),
        @Index(name = "idx_leads_referred_by", columnList = "referredByCode"),
        @Index(name = "idx_leads_created_at", columnList = "createdAt")
})
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    /** Acquisition channel, e.g. "landing", "pricing", "demo", "referral". */
    private String source;

    /** Plan the lead expressed interest in (optional), e.g. "pro". */
    private String planInterest;

    /** Unique code this lead can share to refer others. */
    @Column(nullable = false, unique = true)
    private String referralCode;

    /** Referral code of whoever referred this lead (optional). */
    private String referredByCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status = LeadStatus.NEW;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Lead() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public String getReferredByCode() {
        return referredByCode;
    }

    public void setReferredByCode(String referredByCode) {
        this.referredByCode = referredByCode;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

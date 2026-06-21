package com.orderflowapi.entity;

/**
 * Lifecycle of a marketing lead captured through the growth funnel
 * (landing pages, free-trial CTA, referral program).
 */
public enum LeadStatus {
    NEW,
    CONTACTED,
    CONVERTED,
    LOST
}

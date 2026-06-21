package com.orderflowapi.dto;

import java.util.List;
import java.util.Map;

/**
 * Aggregated growth metrics for the admin growth dashboard.
 */
public class GrowthMetricsResponse {

    private long totalLeads;
    private long convertedLeads;
    private double conversionRate;       // 0-1
    private long referredLeads;          // leads that came via a referral code
    private Map<String, Long> leadsByStatus;
    private Map<String, Long> leadsBySource;
    private List<ReferrerCount> topReferrers;

    public GrowthMetricsResponse(long totalLeads, long convertedLeads, double conversionRate,
                                 long referredLeads, Map<String, Long> leadsByStatus,
                                 Map<String, Long> leadsBySource, List<ReferrerCount> topReferrers) {
        this.totalLeads = totalLeads;
        this.convertedLeads = convertedLeads;
        this.conversionRate = conversionRate;
        this.referredLeads = referredLeads;
        this.leadsByStatus = leadsByStatus;
        this.leadsBySource = leadsBySource;
        this.topReferrers = topReferrers;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public long getConvertedLeads() {
        return convertedLeads;
    }

    public double getConversionRate() {
        return conversionRate;
    }

    public long getReferredLeads() {
        return referredLeads;
    }

    public Map<String, Long> getLeadsByStatus() {
        return leadsByStatus;
    }

    public Map<String, Long> getLeadsBySource() {
        return leadsBySource;
    }

    public List<ReferrerCount> getTopReferrers() {
        return topReferrers;
    }

    /** A referral code and how many leads it brought in. */
    public static class ReferrerCount {
        private String code;
        private long count;

        public ReferrerCount(String code, long count) {
            this.code = code;
            this.count = count;
        }

        public String getCode() {
            return code;
        }

        public long getCount() {
            return count;
        }
    }
}

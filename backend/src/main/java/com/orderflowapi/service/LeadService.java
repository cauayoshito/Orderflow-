package com.orderflowapi.service;

import com.orderflowapi.dto.GrowthMetricsResponse;
import com.orderflowapi.dto.LeadRequest;
import com.orderflowapi.entity.Lead;
import com.orderflowapi.entity.LeadStatus;
import com.orderflowapi.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Captures marketing leads and computes growth metrics.  Each lead receives a
 * unique referral code used by the "indique e ganhe" / affiliate program.
 */
@Service
public class LeadService {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
    private static final int CODE_LENGTH = 7;

    private final LeadRepository leadRepository;
    private final SecureRandom random = new SecureRandom();

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    /**
     * Capture (or update) a lead.  Re-submitting the same email keeps the same
     * lead and referral code, so a person can come back without duplicates.
     */
    @Transactional
    public Lead capture(LeadRequest request) {
        Lead lead = leadRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseGet(Lead::new);

        lead.setName(request.getName().trim());
        lead.setEmail(request.getEmail().trim().toLowerCase());
        if (StringUtils.hasText(request.getPhone())) {
            lead.setPhone(request.getPhone().trim());
        }
        if (StringUtils.hasText(request.getSource())) {
            lead.setSource(request.getSource().trim());
        }
        if (StringUtils.hasText(request.getPlanInterest())) {
            lead.setPlanInterest(request.getPlanInterest().trim());
        }
        // Only set the referrer on first capture and never to the lead's own code.
        if (lead.getId() == null && StringUtils.hasText(request.getReferredByCode())) {
            lead.setReferredByCode(request.getReferredByCode().trim().toUpperCase());
        }
        if (!StringUtils.hasText(lead.getReferralCode())) {
            lead.setReferralCode(generateUniqueCode());
        }
        return leadRepository.save(lead);
    }

    @Transactional(readOnly = true)
    public List<Lead> listAll() {
        return leadRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public GrowthMetricsResponse metrics() {
        List<Lead> leads = leadRepository.findAll();
        long total = leads.size();
        long converted = leadRepository.countByStatus(LeadStatus.CONVERTED);
        double conversionRate = total == 0 ? 0.0 : Math.round((double) converted / total * 10000.0) / 10000.0;

        long referred = leads.stream().filter(l -> StringUtils.hasText(l.getReferredByCode())).count();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (LeadStatus s : LeadStatus.values()) {
            byStatus.put(s.name(), 0L);
        }
        for (Lead l : leads) {
            byStatus.merge(l.getStatus().name(), 1L, Long::sum);
        }

        Map<String, Long> bySource = leads.stream()
                .map(l -> StringUtils.hasText(l.getSource()) ? l.getSource() : "unknown")
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        List<GrowthMetricsResponse.ReferrerCount> topReferrers = leads.stream()
                .filter(l -> StringUtils.hasText(l.getReferredByCode()))
                .collect(Collectors.groupingBy(Lead::getReferredByCode, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new GrowthMetricsResponse.ReferrerCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return new GrowthMetricsResponse(total, converted, conversionRate, referred,
                byStatus, bySource, topReferrers);
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            }
            code = sb.toString();
        } while (leadRepository.existsByReferralCode(code));
        return code;
    }
}

package com.orderflowapi.controller;

import com.orderflowapi.dto.GrowthMetricsResponse;
import com.orderflowapi.dto.LeadRequest;
import com.orderflowapi.dto.LeadResponse;
import com.orderflowapi.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Lead capture and growth metrics.
 *
 * Capture is public ({@code /api/public/leads}) so landing pages and the
 * free-trial CTA can submit without auth.  Listing and metrics are admin-only
 * ({@code /api/admin/leads}).
 */
@RestController
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    /** Public: capture a lead from a landing page / CTA / referral form. */
    @PostMapping("/api/public/leads")
    public ResponseEntity<LeadResponse> capture(@Valid @RequestBody LeadRequest request) {
        LeadResponse response = new LeadResponse(leadService.capture(request));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Admin: list all captured leads (most recent first). */
    @GetMapping("/api/admin/leads")
    public ResponseEntity<List<LeadResponse>> list() {
        List<LeadResponse> leads = leadService.listAll().stream()
                .map(LeadResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(leads);
    }

    /** Admin: growth metrics for the growth dashboard. */
    @GetMapping("/api/admin/leads/metrics")
    public ResponseEntity<GrowthMetricsResponse> metrics() {
        return ResponseEntity.ok(leadService.metrics());
    }
}

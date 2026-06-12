package com.orderflowapi.controller;

import com.orderflowapi.dto.DashboardResponse;
import com.orderflowapi.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only dashboard endpoint aggregating sales, order status breakdown,
 * low-stock products and recent orders.  Secured to ADMIN via the
 * {@code /api/admin/**} rule in {@link com.orderflowapi.security.SecurityConfig}.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}

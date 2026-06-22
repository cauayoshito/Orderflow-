package com.orderflowapi.controller;

import com.orderflowapi.dto.AiTextResponse;
import com.orderflowapi.dto.ProductDescriptionRequest;
import com.orderflowapi.service.AiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only AI endpoints backed by the OrderFlow Intelligence engine (a
 * proprietary Python service — no external AI API).  Secured to ADMIN via the
 * {@code /api/admin/**} rule in {@link com.orderflowapi.security.SecurityConfig}.
 */
@RestController
@RequestMapping("/api/admin/ai")
public class AiController {

    private final AiService aiService;

    @Value("${ai.engine.model:orderflow-intelligence-v1}")
    private String model;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /** Generate a marketing description for a product. */
    @PostMapping("/product-description")
    public ResponseEntity<AiTextResponse> productDescription(@Valid @RequestBody ProductDescriptionRequest request) {
        return ResponseEntity.ok(new AiTextResponse(aiService.generateProductDescription(request), model));
    }

    /** Summarize the last 7 days of sales in plain language. */
    @GetMapping("/weekly-summary")
    public ResponseEntity<AiTextResponse> weeklySummary() {
        return ResponseEntity.ok(new AiTextResponse(aiService.summarizeWeeklySales(), model));
    }

    /** Suggest concrete actions for products running low on stock. */
    @GetMapping("/low-stock-suggestions")
    public ResponseEntity<AiTextResponse> lowStockSuggestions() {
        return ResponseEntity.ok(new AiTextResponse(aiService.suggestLowStockActions(), model));
    }

    // ----- Structured analytics (full engine payloads) ---------------------

    /** Consolidated admin insights: sales trend, inventory and customers. */
    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> insights() {
        return ResponseEntity.ok(aiService.getInsights());
    }

    /** Business KPIs: total sales, orders, average ticket, low-stock count. */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Object>> dashboardSummary() {
        return ResponseEntity.ok(aiService.getDashboardSummary());
    }

    /** Low-stock alerts (with restock suggestions) and no-turnover products. */
    @GetMapping("/stock-alerts")
    public ResponseEntity<Map<String, Object>> stockAlerts() {
        return ResponseEntity.ok(aiService.getStockAlerts());
    }

    /**
     * Sales analysis: top products, average ticket, sales-drop detection and
     * peak hours. {@code windowDays} sets the comparison window (default 7).
     */
    @GetMapping("/sales-analysis")
    public ResponseEntity<Map<String, Object>> salesAnalysis(
            @RequestParam(name = "windowDays", defaultValue = "7") int windowDays) {
        return ResponseEntity.ok(aiService.getSalesAnalysis(windowDays));
    }
}

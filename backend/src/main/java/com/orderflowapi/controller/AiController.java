package com.orderflowapi.controller;

import com.orderflowapi.dto.AiTextResponse;
import com.orderflowapi.dto.ProductDescriptionRequest;
import com.orderflowapi.service.AiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}

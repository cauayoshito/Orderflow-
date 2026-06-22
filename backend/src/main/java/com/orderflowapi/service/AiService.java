package com.orderflowapi.service;

import com.orderflowapi.dto.ProductDescriptionRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

/**
 * AI features backed by the <b>OrderFlow Intelligence</b> engine — a proprietary
 * Python/FastAPI service that analyses the store's own data (sales, stock,
 * customers) using business rules and statistics, with <b>no external AI API</b>.
 *
 * This class is a thin <b>proxy</b>: it forwards requests to the engine over
 * HTTP via Spring's {@link RestClient} and returns the generated text. The
 * engine base URL is read from {@code ai.engine.base-url} (env
 * {@code AI_ENGINE_URL}); when the engine is unreachable these endpoints respond
 * with 503 Service Unavailable so the rest of the app keeps working.
 */
@Service
public class AiService {

    private final RestClient restClient;

    public AiService(@Value("${ai.engine.base-url:http://localhost:8000}") String engineBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(engineBaseUrl).build();
    }

    // ----- Public features -------------------------------------------------

    /** Generate a marketing description for a product via the engine. */
    public String generateProductDescription(ProductDescriptionRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("name", request.getName());
        body.put("category", request.getCategory());
        body.put("keywords", request.getKeywords());

        Map<String, Object> response = post("/product-description", body);
        return requireText(response, "description");
    }

    /** Plain-language analysis of recent sales (drop detection, top products). */
    public String summarizeWeeklySales() {
        Map<String, Object> response = get("/sales-analysis");
        return requireText(response, "narrative");
    }

    /** Concrete actions for low-stock and no-turnover products. */
    public String suggestLowStockActions() {
        Map<String, Object> response = get("/stock-alerts");
        return requireText(response, "narrative");
    }

    // ----- Structured analytics (full engine payloads) ---------------------

    /** Consolidated admin insights (sales + inventory + customers). */
    public Map<String, Object> getInsights() {
        return get("/insights");
    }

    /** Business KPIs: sales, orders, average ticket, low-stock count. */
    public Map<String, Object> getDashboardSummary() {
        return get("/dashboard-summary");
    }

    /** Low-stock alerts (with restock suggestions) and no-turnover products. */
    public Map<String, Object> getStockAlerts() {
        return get("/stock-alerts");
    }

    /** Sales analysis: ranking, average ticket, drop detection, peak hours. */
    public Map<String, Object> getSalesAnalysis(int windowDays) {
        return get("/sales-analysis?window_days=" + windowDays);
    }

    // ----- Internals -------------------------------------------------------

    @SuppressWarnings("unchecked")
    private Map<String, Object> get(String path) {
        try {
            return restClient.get()
                    .uri(path)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            throw upstreamError(ex);
        } catch (RestClientException ex) {
            throw unreachable();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> post(String path, Map<String, Object> body) {
        try {
            return restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            throw upstreamError(ex);
        } catch (RestClientException ex) {
            throw unreachable();
        }
    }

    private String requireText(Map<String, Object> response, String key) {
        Object value = response == null ? null : response.get(key);
        String text = value == null ? null : value.toString().trim();
        if (!StringUtils.hasText(text)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "The OrderFlow Intelligence engine returned an empty response. Please try again.");
        }
        return text;
    }

    private ResponseStatusException upstreamError(RestClientResponseException ex) {
        // 422 (validation) bubbles up as a 400; everything else is a bad gateway.
        HttpStatus status = ex.getStatusCode().value() == 422
                ? HttpStatus.BAD_REQUEST
                : HttpStatus.BAD_GATEWAY;
        return new ResponseStatusException(status,
                "OrderFlow Intelligence request failed (" + ex.getStatusCode() + ").");
    }

    private ResponseStatusException unreachable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "AI features are unavailable: the OrderFlow Intelligence engine could not be reached. "
                        + "Check that the ai-engine service is running and AI_ENGINE_URL is correct.");
    }
}

package com.orderflowapi.service;

import com.orderflowapi.dto.ProductDescriptionRequest;
import com.orderflowapi.entity.Order;
import com.orderflowapi.entity.OrderStatus;
import com.orderflowapi.entity.Product;
import com.orderflowapi.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI features powered by the Claude Messages API: product-description
 * generation, weekly sales summaries and low-stock restock suggestions.
 *
 * Calls go over HTTP via Spring's {@link RestClient} (no extra SDK on the
 * classpath).  The API key is read from the {@code anthropic.api-key} property,
 * falling back to the {@code ANTHROPIC_API_KEY} environment variable.  When no
 * key is configured these endpoints respond with 503 Service Unavailable so the
 * rest of the app keeps working.
 */
@Service
public class AiService {

    private static final String MESSAGES_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final RestClient restClient;

    @Value("${anthropic.api-key:}")
    private String configuredApiKey;

    @Value("${anthropic.model:claude-opus-4-8}")
    private String model;

    @Value("${app.inventory.low-stock-threshold:5}")
    private int lowStockThreshold;

    public AiService(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.restClient = RestClient.builder().baseUrl(MESSAGES_URL).build();
    }

    // ----- Public features -------------------------------------------------

    public String generateProductDescription(ProductDescriptionRequest request) {
        StringBuilder facts = new StringBuilder("Nome do produto: ").append(request.getName());
        if (StringUtils.hasText(request.getCategory())) {
            facts.append("\nCategoria: ").append(request.getCategory());
        }
        if (StringUtils.hasText(request.getKeywords())) {
            facts.append("\nPalavras-chave: ").append(request.getKeywords());
        }
        String system = "Você é um copywriter de e-commerce para pequenos negócios brasileiros. "
                + "Escreva descrições de produto persuasivas, claras e honestas em português do Brasil.";
        String user = "Escreva uma descrição de produto com 2 a 3 frases (máx. 60 palavras), "
                + "destacando benefícios e um tom acolhedor. Responda apenas com o texto da descrição, "
                + "sem títulos nem aspas.\n\n" + facts;
        return complete(system, user, 400);
    }

    @Transactional(readOnly = true)
    public String summarizeWeeklySales() {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Order> orders = orderRepository.findByOrderDateAfter(since);

        long count = orders.size();
        double revenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELED)
                .mapToDouble(OrderService::calculateTotal)
                .sum();
        long canceled = orders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELED).count();

        String data = String.format(
                "Pedidos nos últimos 7 dias: %d%nReceita (sem cancelados): R$ %.2f%nPedidos cancelados: %d",
                count, revenue, canceled);

        String system = "Você é um analista de negócios que explica métricas de vendas de forma simples "
                + "para o dono de um pequeno negócio. Responda em português do Brasil.";
        String user = "Com base nos dados abaixo, escreva um resumo curto (3 a 5 frases) das vendas da semana, "
                + "com um destaque positivo e um ponto de atenção quando fizer sentido.\n\n" + data;
        return complete(system, user, 500);
    }

    @Transactional(readOnly = true)
    public String suggestLowStockActions() {
        List<Product> lowStock = productService.getLowStockProducts(lowStockThreshold);
        if (lowStock.isEmpty()) {
            return "Nenhum produto está com estoque baixo no momento. Continue monitorando o painel.";
        }
        StringBuilder list = new StringBuilder();
        for (Product p : lowStock) {
            list.append(String.format("- %s: %d unidades em estoque (preço R$ %.2f)%n",
                    p.getName(), p.getStockQuantity(), p.getPrice()));
        }
        String system = "Você é um consultor de operações para pequenos negócios. "
                + "Responda em português do Brasil de forma objetiva e prática.";
        String user = "Os produtos abaixo estão com estoque baixo. Sugira ações concretas (reposição, "
                + "promoção, comunicação ao cliente) em uma lista curta com no máximo 5 itens.\n\n" + list;
        return complete(system, user, 600);
    }

    // ----- Internals -------------------------------------------------------

    @SuppressWarnings("unchecked")
    private String complete(String system, String user, int maxTokens) {
        String apiKey = resolveApiKey();

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "system", system,
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", user
                ))
        );

        Map<String, Object> response;
        try {
            response = restClient.post()
                    .uri(MESSAGES_URL)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            HttpStatus status = ex.getStatusCode().value() == 401 || ex.getStatusCode().value() == 403
                    ? HttpStatus.SERVICE_UNAVAILABLE
                    : HttpStatus.BAD_GATEWAY;
            throw new ResponseStatusException(status,
                    "Claude API request failed (" + ex.getStatusCode() + ").");
        }

        String text = extractText(response);
        if (!StringUtils.hasText(text)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "The AI service returned an empty response. Please try again.");
        }
        return text.trim();
    }

    /**
     * Pull and concatenate the text from a Messages API response:
     * {@code {"content": [{"type":"text","text":"..."}]}}.
     */
    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) {
            return null;
        }
        Object content = response.get("content");
        if (!(content instanceof List<?> blocks)) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (Object block : blocks) {
            if (block instanceof Map<?, ?> map && "text".equals(map.get("type"))) {
                Object text = map.get("text");
                if (text != null) {
                    sb.append(text);
                }
            }
        }
        return sb.toString();
    }

    private String resolveApiKey() {
        String key = StringUtils.hasText(configuredApiKey) ? configuredApiKey : System.getenv("ANTHROPIC_API_KEY");
        if (!StringUtils.hasText(key)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI features are disabled: set the ANTHROPIC_API_KEY environment variable to enable them.");
        }
        return key;
    }
}

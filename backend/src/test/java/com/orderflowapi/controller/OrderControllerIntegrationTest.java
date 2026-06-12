package com.orderflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflowapi.dto.OrderItemRequest;
import com.orderflowapi.dto.OrderRequest;
import com.orderflowapi.dto.OrderStatusUpdateRequest;
import com.orderflowapi.entity.Customer;
import com.orderflowapi.entity.OrderStatus;
import com.orderflowapi.entity.Product;
import com.orderflowapi.repository.CustomerRepository;
import com.orderflowapi.repository.OrderRepository;
import com.orderflowapi.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link OrderController}.  These tests bring up the
 * Spring context and exercise the HTTP layer using {@link MockMvc} while
 * applying Spring Security constraints via {@link WithMockUser}.  A simple
 * in-memory database is used to persist entities during the test.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    private Customer customer;
    private Product product;

    @BeforeEach
    void initData() {
        // Clean repositories in case leftover data persists (transactional resets automatically but explicit is safe)
        orderRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();

        // Create a customer and a product for testing
        customer = new Customer();
        customer.setName("Integration User");
        customer.setEmail("integration@example.com");
        customer.setPhone("123456789");
        customer.setAddress("123 Test Street");
        customer = customerRepository.save(customer);

        product = new Product();
        product.setName("Integration Product");
        product.setDescription("A product used in integration tests");
        product.setPrice(15.0);
        product.setStockQuantity(100);
        product = productRepository.save(product);
    }

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void createOrder_asClient_returnsCreatedOrder() throws Exception {
        // Arrange
        OrderItemRequest item = new OrderItemRequest(product.getId(), 3);
        OrderRequest request = new OrderRequest(customer.getId(), List.of(item));
        String json = objectMapper.writeValueAsString(request);

        // Act & Assert
        mockMvc.perform(post("/api/customer/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is(OrderStatus.PENDING.name())))
                .andExpect(jsonPath("$.customerId", is(customer.getId().intValue())))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productId", is(product.getId().intValue())))
                .andExpect(jsonPath("$.total", is(closeTo(45.0, 0.001))));
    }

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void getOrderById_returnsOrder() throws Exception {
        // First create an order via service
        OrderItemRequest item = new OrderItemRequest(product.getId(), 1);
        OrderRequest request = new OrderRequest(customer.getId(), List.of(item));
        String json = objectMapper.writeValueAsString(request);
        MvcResult result = mockMvc.perform(post("/api/customer/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andReturn();
        // Parse order id from response
        String responseBody = result.getResponse().getContentAsString();
        com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(responseBody);
        Long orderId = node.get("id").asLong();

        // Retrieve the order
        mockMvc.perform(get("/api/customer/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(orderId.intValue())))
                .andExpect(jsonPath("$.status", is(OrderStatus.PENDING.name())))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productId", is(product.getId().intValue())));
    }

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void getOrdersByCustomer_returnsList() throws Exception {
        // Create two orders for the same customer
        OrderItemRequest item = new OrderItemRequest(product.getId(), 1);
        OrderRequest request1 = new OrderRequest(customer.getId(), List.of(item));
        String json1 = objectMapper.writeValueAsString(request1);
        mockMvc.perform(post("/api/customer/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json1))
                .andExpect(status().isCreated());

        OrderItemRequest item2 = new OrderItemRequest(product.getId(), 2);
        OrderRequest request2 = new OrderRequest(customer.getId(), List.of(item2));
        String json2 = objectMapper.writeValueAsString(request2);
        mockMvc.perform(post("/api/customer/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json2))
                .andExpect(status().isCreated());

        // Fetch orders for the customer
        mockMvc.perform(get("/api/customer/orders/customer/{customerId}", customer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateOrderStatus_asAdmin_updatesStatus() throws Exception {
        // Create an order first (as admin or client; user role doesn't matter for creation path restrictions because DataInitializer roles apply) using service via controller
        OrderItemRequest itemReq = new OrderItemRequest(product.getId(), 1);
        OrderRequest createReq = new OrderRequest(customer.getId(), List.of(itemReq));
        String createJson = objectMapper.writeValueAsString(createReq);
        MvcResult result = mockMvc.perform(post("/api/customer/orders")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("user").roles("CLIENTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();
        // Parse ID
        Long orderId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

        // Prepare status update request
        OrderStatusUpdateRequest statusReq = new OrderStatusUpdateRequest(OrderStatus.CONFIRMED.name());
        String statusJson = objectMapper.writeValueAsString(statusReq);

        // Update status as admin
        mockMvc.perform(patch("/api/admin/orders/{id}/status", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(OrderStatus.CONFIRMED.name())));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateOrderStatus_invalidTransition_returnsBadRequest() throws Exception {
        // Create an order then deliver it so that further transitions are invalid
        OrderItemRequest itemReq = new OrderItemRequest(product.getId(), 1);
        OrderRequest createReq = new OrderRequest(customer.getId(), List.of(itemReq));
        String createJson = objectMapper.writeValueAsString(createReq);
        MvcResult result = mockMvc.perform(post("/api/customer/orders")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("user").roles("CLIENTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();
        Long orderId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
        // Transition to SHIPPED via CONFIRMED then PROCESSING then SHIPPED using service or repository to circumvent endpoint restrictions
        // For brevity in tests, update order entity directly
        var order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        OrderStatusUpdateRequest statusReq = new OrderStatusUpdateRequest(OrderStatus.CONFIRMED.name());
        String statusJson = objectMapper.writeValueAsString(statusReq);

        mockMvc.perform(patch("/api/admin/orders/{id}/status", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusJson))
                .andExpect(status().isBadRequest());
    }
}

package com.orderflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflowapi.dto.ProductRequest;
import com.orderflowapi.entity.Product;
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
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for {@link ProductController}.  These tests exercise the
 * product endpoints with proper security roles.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createProduct_asAdmin_returnsCreatedProduct() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Test Product");
        request.setDescription("Integration test product");
        request.setPrice(12.5);
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Test Product")))
                .andExpect(jsonPath("$.price", is(12.5)));
        // Verify repository contains one product
        assertEquals(1, productRepository.count());
    }

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void createProduct_asClient_forbidden() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Client Product");
        request.setDescription("Should not be created");
        request.setPrice(5.0);
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
        // Ensure repository still empty
        assertEquals(0, productRepository.count());
    }

    @Test
    @WithMockUser(roles = {"CLIENTE"})
    void getProducts_returnsList() throws Exception {
        // Pre-populate two products
        productRepository.save(new Product("Prod A", "A", 10.0));
        productRepository.save(new Product("Prod B", "B", 20.0));
        mockMvc.perform(get("/api/customer/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }
}

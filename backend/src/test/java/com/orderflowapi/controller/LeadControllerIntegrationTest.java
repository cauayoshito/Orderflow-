package com.orderflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflowapi.dto.LeadRequest;
import com.orderflowapi.entity.Lead;
import com.orderflowapi.repository.LeadRepository;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link LeadController}: public capture and admin views.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class LeadControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LeadRepository leadRepository;

    @BeforeEach
    void setUp() {
        leadRepository.deleteAll();
    }

    @Test
    void capture_isPublic_andGeneratesReferralCode() throws Exception {
        LeadRequest req = new LeadRequest();
        req.setName("Maria Teste");
        req.setEmail("Maria@Example.com");
        req.setSource("landing");

        mockMvc.perform(post("/api/public/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("maria@example.com")))
                .andExpect(jsonPath("$.referralCode", not(emptyOrNullString())))
                .andExpect(jsonPath("$.status", is("NEW")));

        assertEquals(1, leadRepository.count());
    }

    @Test
    void capture_sameEmailTwice_doesNotDuplicate() throws Exception {
        LeadRequest req = new LeadRequest();
        req.setName("Joao");
        req.setEmail("joao@example.com");
        req.setSource("pricing");
        String json = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/public/leads").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/public/leads").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());

        assertEquals(1, leadRepository.count());
    }

    @Test
    void capture_invalidEmail_returnsBadRequest() throws Exception {
        LeadRequest req = new LeadRequest();
        req.setName("Sem Email");
        req.setEmail("not-an-email");

        mockMvc.perform(post("/api/public/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listLeads_withoutAuth_isRejected() throws Exception {
        mockMvc.perform(get("/api/admin/leads"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void metrics_asAdmin_returnsAggregates() throws Exception {
        Lead a = new Lead();
        a.setName("A"); a.setEmail("a@x.com"); a.setSource("landing");
        a.setReferralCode("CODEAAA");
        leadRepository.save(a);

        Lead b = new Lead();
        b.setName("B"); b.setEmail("b@x.com"); b.setSource("referral");
        b.setReferralCode("CODEBBB"); b.setReferredByCode("CODEAAA");
        leadRepository.save(b);

        mockMvc.perform(get("/api/admin/leads/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLeads", is(2)))
                .andExpect(jsonPath("$.referredLeads", is(1)))
                .andExpect(jsonPath("$.topReferrers[0].code", is("CODEAAA")));
    }
}

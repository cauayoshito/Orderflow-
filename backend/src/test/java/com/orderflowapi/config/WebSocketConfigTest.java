package com.orderflowapi.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * Configuration test for {@link WebSocketConfig}.  Loads the Spring context
 * (H2 profile) and verifies the STOMP endpoint and broker are configured,
 * without opening a real WebSocket connection.
 */
@SpringBootTest
@ActiveProfiles("test")
class WebSocketConfigTest {

    @Autowired
    private WebSocketConfig webSocketConfig;

    @Test
    void stompEndpointWsIsRegistered() {
        assertNotNull(webSocketConfig);
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class, RETURNS_DEEP_STUBS);

        webSocketConfig.registerStompEndpoints(registry);

        verify(registry).addEndpoint("/ws");
    }

    @Test
    void brokerIsConfiguredWithTopicPrefix() {
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class, RETURNS_DEEP_STUBS);

        webSocketConfig.configureMessageBroker(registry);

        verify(registry).enableSimpleBroker("/topic");
        verify(registry).setApplicationDestinationPrefixes("/app");
    }
}

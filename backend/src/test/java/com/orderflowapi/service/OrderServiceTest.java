package com.orderflowapi.service;

import com.orderflowapi.dto.OrderItemRequest;
import com.orderflowapi.dto.OrderRequest;
import com.orderflowapi.dto.OrderResponse;
import com.orderflowapi.entity.Customer;
import com.orderflowapi.entity.Order;
import com.orderflowapi.entity.OrderStatus;
import com.orderflowapi.entity.Product;
import com.orderflowapi.exception.ResourceNotFoundException;
import com.orderflowapi.repository.CustomerRepository;
import com.orderflowapi.repository.OrderRepository;
import com.orderflowapi.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link OrderService}.  These tests use Mockito to mock
 * repository dependencies and verify that the service behaves correctly when
 * creating orders and updating status, including validation and allowed
 * transitions.
 */
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private OrderService orderService;

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("John Doe");
        customer.setEmail("john@example.com");

        product = new Product();
        product.setId(2L);
        product.setName("Widget");
        product.setDescription("Test product");
        product.setPrice(10.0);
        product.setStockQuantity(100);
    }

    @Test
    void createOrder_validRequest_createsOrder() {
        // Arrange
        OrderItemRequest itemRequest = new OrderItemRequest(product.getId(), 2);
        OrderRequest orderRequest = new OrderRequest(customer.getId(), List.of(itemRequest));

        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        OrderResponse response = orderService.createOrder(orderRequest);

        // Assert
        assertNotNull(response);
        assertEquals(OrderStatus.PENDING.name(), response.getStatus());
        assertEquals(1, response.getItems().size());
        assertEquals(product.getName(), response.getItems().get(0).getProductName());
        assertEquals(product.getId(), response.getItems().get(0).getProductId());
        assertEquals(2, response.getItems().get(0).getQuantity());
        assertEquals(20.0, response.getTotal());
        // Stock is decremented by the ordered quantity
        assertEquals(98, product.getStockQuantity());
        // Verify that repositories were called correctly
        verify(customerRepository).findById(customer.getId());
        verify(productRepository).findById(product.getId());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_insufficientStock_throwsException() {
        // Arrange: request more units than are in stock
        product.setStockQuantity(1);
        OrderItemRequest itemRequest = new OrderItemRequest(product.getId(), 5);
        OrderRequest orderRequest = new OrderRequest(customer.getId(), List.of(itemRequest));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(orderRequest));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void createOrder_customerNotFound_throwsException() {
        // Arrange
        OrderItemRequest itemRequest = new OrderItemRequest(product.getId(), 1);
        OrderRequest orderRequest = new OrderRequest(customer.getId(), List.of(itemRequest));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(orderRequest));
        verify(customerRepository).findById(customer.getId());
        verify(productRepository, never()).findById(any());
    }

    @Test
    void createOrder_productNotFound_throwsException() {
        // Arrange
        OrderItemRequest itemRequest = new OrderItemRequest(product.getId(), 1);
        OrderRequest orderRequest = new OrderRequest(customer.getId(), List.of(itemRequest));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(productRepository.findById(product.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(orderRequest));
        verify(customerRepository).findById(customer.getId());
        verify(productRepository).findById(product.getId());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateOrderStatus_validTransition_updatesStatus() {
        // Arrange
        Long orderId = 100L;
        Order order = new Order(customer);
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        OrderResponse response = orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);

        // Assert
        assertEquals(OrderStatus.CONFIRMED.name(), response.getStatus());
        verify(orderRepository).findById(orderId);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void updateOrderStatus_invalidTransition_throwsException() {
        // Arrange: order in DELIVERED status cannot transition
        Long orderId = 101L;
        Order order = new Order(customer);
        order.setId(orderId);
        order.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED));
        verify(orderRepository).findById(orderId);
        verify(orderRepository, never()).save(any());
    }
}

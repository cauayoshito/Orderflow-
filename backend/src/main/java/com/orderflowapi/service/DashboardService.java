package com.orderflowapi.service;

import com.orderflowapi.dto.DashboardResponse;
import com.orderflowapi.dto.OrderResponse;
import com.orderflowapi.dto.ProductResponse;
import com.orderflowapi.entity.Order;
import com.orderflowapi.entity.OrderStatus;
import com.orderflowapi.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Computes the admin dashboard metrics.  Marked read-only transactional so the
 * lazy order/item associations stay loadable while we aggregate them.
 */
@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final OrderService orderService;

    @Value("${app.inventory.low-stock-threshold:5}")
    private int lowStockThreshold;

    public DashboardService(OrderRepository orderRepository, ProductService productService,
                            OrderService orderService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.orderService = orderService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        List<Order> allOrders = orderRepository.findAll();

        // Total sales = sum of all non-cancelled order totals
        double totalSales = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELED)
                .mapToDouble(OrderService::calculateTotal)
                .sum();

        // Orders grouped by status, every status represented (zero-filled)
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status.name(), 0L);
        }
        for (Order order : allOrders) {
            ordersByStatus.merge(order.getStatus().name(), 1L, Long::sum);
        }

        List<ProductResponse> lowStock = productService.getLowStockProducts(lowStockThreshold).stream()
                .map(productService::toDto)
                .collect(Collectors.toList());

        List<OrderResponse> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc().stream()
                .map(orderService::toOrderResponse)
                .collect(Collectors.toList());

        return new DashboardResponse(round(totalSales), allOrders.size(), ordersByStatus, lowStock, recentOrders);
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

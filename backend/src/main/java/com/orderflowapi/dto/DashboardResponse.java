package com.orderflowapi.dto;

import java.util.List;
import java.util.Map;

/**
 * Aggregated metrics for the admin dashboard: total sales, order counts grouped
 * by status, products running low on stock and the most recent orders.
 */
public class DashboardResponse {

    private double totalSales;
    private long totalOrders;
    private Map<String, Long> ordersByStatus;
    private List<ProductResponse> lowStockProducts;
    private List<OrderResponse> recentOrders;

    public DashboardResponse(double totalSales, long totalOrders, Map<String, Long> ordersByStatus,
                             List<ProductResponse> lowStockProducts, List<OrderResponse> recentOrders) {
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.ordersByStatus = ordersByStatus;
        this.lowStockProducts = lowStockProducts;
        this.recentOrders = recentOrders;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public List<ProductResponse> getLowStockProducts() {
        return lowStockProducts;
    }

    public List<OrderResponse> getRecentOrders() {
        return recentOrders;
    }
}

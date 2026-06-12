package com.orderflowapi.entity;

import jakarta.persistence.*;

/**
 * Product entity holds inventory items that can be ordered.  Each product has
 * a name, description, price and a tracked stock quantity.  Stock enables the
 * low-stock dashboard widget and prevents overselling when orders are placed.
 *
 * The price is stored as a {@code Double} for simplicity in this portfolio
 * project; a production system handling money should prefer
 * {@link java.math.BigDecimal} to avoid floating-point rounding issues.
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    /**
     * Units currently available to sell.  Defaults to zero so a product is
     * never accidentally created with phantom inventory.  The order flow
     * decrements this value and rejects orders that exceed it.
     */
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    public Product() {
    }

    public Product(String name, String description, Double price) {
        this(name, description, price, 0);
    }

    public Product(String name, String description, Double price, Integer stockQuantity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity != null ? stockQuantity : 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity != null ? stockQuantity : 0;
    }
}

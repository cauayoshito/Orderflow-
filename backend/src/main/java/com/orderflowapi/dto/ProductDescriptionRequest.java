package com.orderflowapi.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Input for AI product-description generation.  Only the product name is
 * required; optional category and keywords help steer the copy.
 */
public class ProductDescriptionRequest {

    @NotBlank
    private String name;

    private String category;

    /** Free-form comma-separated hints, e.g. "handmade, organic, gift". */
    private String keywords;

    public ProductDescriptionRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }
}

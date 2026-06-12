package com.orderflowapi.service;

import com.orderflowapi.dto.ProductRequest;
import com.orderflowapi.dto.ProductResponse;
import com.orderflowapi.entity.Product;
import com.orderflowapi.exception.ResourceNotFoundException;
import com.orderflowapi.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer encapsulating business logic for product management.  Provides
 * CRUD operations, low-stock queries and maps between entity and DTO types.
 * Using a service decouples controllers from persistence concerns and allows
 * for future extension, such as caching or event publication.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Retrieve all products and map them to response DTOs.
     */
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a single product by id or throw ResourceNotFoundException.
     */
    public ProductResponse getProductById(Long id) {
        return toDto(getEntityById(id));
    }

    /**
     * Retrieve a product entity by id or throw ResourceNotFoundException.
     * Exposed for other services that need the managed entity.
     */
    public Product getEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }

    /**
     * Products at or below the given stock threshold, used by the admin
     * dashboard and the AI restock-suggestion feature.
     */
    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByStockQuantityLessThanEqual(threshold);
    }

    /**
     * Create a new product from a request DTO.
     */
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product = productRepository.save(product);
        return toDto(product);
    }

    /**
     * Update an existing product by id.  Throws ResourceNotFoundException if
     * the product does not exist.  Stock is only overwritten when explicitly
     * provided so a price/description edit doesn't wipe inventory.
     */
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = getEntityById(id);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        product = productRepository.save(product);
        return toDto(product);
    }

    /**
     * Delete a product by id.  Throws ResourceNotFoundException if the product
     * does not exist.
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getEntityById(id);
        productRepository.delete(product);
    }

    /**
     * Convert a Product entity to a ProductResponse DTO.
     */
    public ProductResponse toDto(Product product) {
        return new ProductResponse(product.getId(), product.getName(),
                product.getDescription(), product.getPrice(), product.getStockQuantity());
    }
}

package com.orderflowapi.controller;

import com.orderflowapi.dto.ProductRequest;
import com.orderflowapi.dto.ProductResponse;
import com.orderflowapi.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing CRUD operations for products.  The endpoints are
 * separated into customer and admin namespaces to reflect differing access
 * rights: customers (and admins) may list and view products while only
 * admins may create, update or delete products.  Access is enforced by the
 * {@link com.orderflowapi.security.SecurityConfig} path patterns.
 */
@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * List all products.  Accessible to clients with the CLIENTE or ADMIN
     * roles.  The list is returned as a collection of response DTOs.
     *
     * @return list of all products
     */
    @GetMapping("/customer/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Retrieve a product by its id.  Accessible to clients with the CLIENTE
     * or ADMIN roles.  Throws {@link ResourceNotFoundException} if no product
     * is found for the given id.
     *
     * @param id identifier of the product
     * @return product response DTO
     */
    @GetMapping("/customer/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Create a new product.  Accessible only to users with the ADMIN role.
     *
     * @param request product data from client
     * @return newly created product
     */
    @PostMapping("/admin/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Update an existing product by its id.  Accessible only to users with the
     * ADMIN role.  Throws {@link ResourceNotFoundException} if the product
     * does not exist.
     *
     * @param id      identifier of the product to update
     * @param request updated product data
     * @return the updated product
     */
    @PutMapping("/admin/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id,
                                                         @Valid @RequestBody ProductRequest request) {
        ProductResponse updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a product by its id.  Accessible only to users with the ADMIN
     * role.  Throws {@link ResourceNotFoundException} if the product does not
     * exist.
     *
     * @param id identifier of the product to delete
     * @return 204 No Content on successful deletion
     */
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}

package com.orderflowapi.repository;

import com.orderflowapi.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Products.  Provides finders by name and by low stock level.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);

    /**
     * Products whose stock is at or below the given threshold, ordered from the
     * lowest stock first so the most urgent items surface at the top.
     */
    List<Product> findByStockQuantityLessThanEqualOrderByStockQuantityAsc(int threshold);

    default List<Product> findByStockQuantityLessThanEqual(int threshold) {
        return findByStockQuantityLessThanEqualOrderByStockQuantityAsc(threshold);
    }
}

package com.orderflowapi.config;

import com.orderflowapi.entity.Coupon;
import com.orderflowapi.entity.CouponType;
import com.orderflowapi.entity.Product;
import com.orderflowapi.entity.Role;
import com.orderflowapi.entity.User;
import com.orderflowapi.repository.CouponRepository;
import com.orderflowapi.repository.ProductRepository;
import com.orderflowapi.repository.RoleRepository;
import com.orderflowapi.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seeds initial data into the database: the core roles (ADMIN and CLIENTE), a
 * default admin user, and a small product catalogue (with stock) so the
 * storefront and dashboard have something to show on first run.
 *
 * Disabled under the {@code test} profile so integration tests control their
 * own fixtures.
 */
@Configuration
@Profile("!test")
public class DataInitializer {

    @Bean
    CommandLineRunner initData(RoleRepository roleRepository,
                               UserRepository userRepository,
                               ProductRepository productRepository,
                               CouponRepository couponRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure roles exist
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_ADMIN");
                return roleRepository.save(r);
            });

            roleRepository.findByName("ROLE_CLIENTE").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_CLIENTE");
                return roleRepository.save(r);
            });

            // Create default admin user if none exists
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@orderflow.local");
                admin.setPassword(passwordEncoder.encode("admin123"));
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);
                userRepository.save(admin);
            }

            // Seed a starter catalogue once
            if (productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                        new Product("Café Especial 250g", "Grãos torrados artesanalmente, notas de chocolate e caramelo.", 32.90, 40),
                        new Product("Caneca de Cerâmica", "Caneca handmade de 300ml, ideal para o seu café da manhã.", 45.00, 12),
                        new Product("Kit Presente Gourmet", "Combo com café, caneca e biscoitos artesanais.", 89.90, 3),
                        new Product("Chá de Hibisco 100g", "Chá natural, refrescante e sem cafeína.", 24.50, 0),
                        new Product("Garrafa Térmica 500ml", "Mantém a temperatura por até 12 horas.", 79.90, 25),
                        new Product("Biscoitos Artesanais", "Caixa com 12 biscoitos amanteigados.", 19.90, 4)
                ));
            }

            // Seed a welcome coupon for the storefront / demo once
            if (couponRepository.count() == 0) {
                Coupon welcome = new Coupon();
                welcome.setCode("BEMVINDO10");
                welcome.setType(CouponType.PERCENT);
                welcome.setValue(10.0);
                welcome.setActive(true);
                couponRepository.save(welcome);
            }
        };
    }
}

package com.orderflowapi.repository;

import com.orderflowapi.entity.RefreshToken;
import com.orderflowapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for managing refresh tokens.  Provides methods to find a token by
 * its string value and to remove tokens when a user logs out or the token
 * expires.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    int deleteByUser(User user);
}
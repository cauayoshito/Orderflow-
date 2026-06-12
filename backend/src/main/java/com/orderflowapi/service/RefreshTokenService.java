package com.orderflowapi.service;

import com.orderflowapi.entity.RefreshToken;
import com.orderflowapi.entity.User;
import com.orderflowapi.exception.TokenRefreshException;
import com.orderflowapi.repository.RefreshTokenRepository;
import com.orderflowapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Service encapsulating logic around refresh tokens: creation, validation and
 * deletion.  Tokens are persisted in the database and carry an expiration
 * timestamp.  When a token expires it is removed and the client must login
 * again to obtain a new one.
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    /**
     * Duration in milliseconds a refresh token should remain valid.  If not
     * explicitly set via properties the default is 7 days.
     */
    @Value("${jwt.refreshExpiration:604800000}") // 7 days by default
    private Long refreshTokenDurationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new refresh token for the given user ID.  If a token already
     * exists for this user it will be replaced.  A UUID is used as the token
     * value.
     */
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for id " + userId));
        // Delete any existing token for this user
        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Find a refresh token by its token string.
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Verify that a refresh token has not expired.  If it has expired the token
     * is deleted and a TokenRefreshException is thrown.
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token has expired. Please login again.");
        }
        return token;
    }
}
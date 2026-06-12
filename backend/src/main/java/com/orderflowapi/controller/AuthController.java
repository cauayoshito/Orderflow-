package com.orderflowapi.controller;

import com.orderflowapi.dto.AuthRequest;
import com.orderflowapi.dto.AuthResponse;
import com.orderflowapi.dto.RefreshTokenRequest;
import com.orderflowapi.dto.RegisterRequest;
import com.orderflowapi.entity.RefreshToken;
import com.orderflowapi.entity.User;
import com.orderflowapi.exception.TokenRefreshException;
import com.orderflowapi.service.RefreshTokenService;
import com.orderflowapi.service.UserService;
import com.orderflowapi.security.JwtService;
import com.orderflowapi.security.CustomUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller exposing authentication endpoints: user registration, login
 * and token refresh.  It uses Spring Security's AuthenticationManager to
 * authenticate credentials and our JwtService to generate access tokens.  A
 * RefreshTokenService issues long‑lived refresh tokens allowing clients to
 * obtain new access tokens without re‑entering credentials.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;
    private final com.orderflowapi.repository.UserRepository userRepository;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService,
                          UserService userService,
                          CustomUserDetailsService userDetailsService,
                          com.orderflowapi.repository.UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userService = userService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    /**
     * Register a new user.  Validation and uniqueness errors are translated by
     * {@link com.orderflowapi.exception.GlobalExceptionHandler}.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = userService.registerUser(registerRequest);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "User registered successfully");
        body.put("id", user.getId());
        body.put("username", user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Authenticate a user using username and password.  Returns an access
     * token and a refresh token along with user details.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate access token using Spring Security UserDetails
        UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        String accessToken = jwtService.generateToken(userDetails);

        // Load full user entity to extract id, email and roles
        com.orderflowapi.entity.User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        List<String> roles = user.getRoles().stream()
                .map(com.orderflowapi.entity.Role::getName)
                .collect(Collectors.toList());

        Long customerId = user.getCustomer() != null ? user.getCustomer().getId() : null;
        AuthResponse response = new AuthResponse(accessToken, refreshToken.getToken(),
                user.getId(), user.getUsername(), user.getEmail(), roles, customerId);
        return ResponseEntity.ok(response);
    }

    /**
     * Exchange a valid refresh token for a new access token.  If the provided
     * token has expired or is no longer recognised a TokenRefreshException is
     * thrown.  Clients should handle this by asking the user to login again.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken)
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database"));
        refreshTokenService.verifyExpiration(refreshToken);
        // If token is valid, generate new access token
        User user = refreshToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);
        List<String> roles = user.getRoles().stream()
                .map(com.orderflowapi.entity.Role::getName)
                .collect(Collectors.toList());
        Long customerId = user.getCustomer() != null ? user.getCustomer().getId() : null;
        AuthResponse response = new AuthResponse(token, requestRefreshToken,
                user.getId(), user.getUsername(), user.getEmail(), roles, customerId);
        return ResponseEntity.ok(response);
    }
}
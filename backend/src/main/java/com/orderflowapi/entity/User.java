package com.orderflowapi.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * User entity stores authentication credentials and holds the relation to
 * assigned roles.  Passwords should be stored as a BCrypt hash.  The
 * username is unique and used as the principal identifier when authenticating
 * via Spring Security.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Roles assigned to this user.  The many‑to‑many relationship is mapped via
     * the join table 'users_roles'.  FetchType.EAGER ensures that roles are
     * loaded along with the user for authentication.  In large systems you may
     * consider LAZY loading, but EAGER simplifies the example.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "users_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    /**
     * Optional link to the customer profile used when placing orders.  A
     * customer profile is created automatically when a CLIENTE registers, so
     * the frontend can resolve "my orders" and checkout from the logged-in
     * user.  Admin users typically have no customer profile.
     */
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    public User() {
    }

    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
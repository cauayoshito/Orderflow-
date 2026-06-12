package com.orderflowapi.entity;

import jakarta.persistence.*;

/**
 * Role entity represents a user authority within the system.  Users can be
 * assigned multiple roles via a many‑to‑many relationship.  Each role has a
 * unique name such as "ROLE_USER" or "ROLE_ADMIN".  Using roles allows
 * fine‑grained authorisation checks in Spring Security.
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Role() {
    }

    public Role(String name) {
        this.name = name;
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
}
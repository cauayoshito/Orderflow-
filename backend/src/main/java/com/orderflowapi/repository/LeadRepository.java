package com.orderflowapi.repository;

import com.orderflowapi.entity.Lead;
import com.orderflowapi.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for marketing {@link Lead}s captured by the growth funnel.
 */
public interface LeadRepository extends JpaRepository<Lead, Long> {

    boolean existsByReferralCode(String referralCode);

    Optional<Lead> findByEmail(String email);

    List<Lead> findByReferredByCode(String referredByCode);

    long countByStatus(LeadStatus status);

    List<Lead> findAllByOrderByCreatedAtDesc();
}

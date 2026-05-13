package com.example.Quora.repository;

import com.example.Quora.models.Subscription;
import com.example.Quora.models.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsByCreatorIdAndSubscriberIdAndStatus(Long creatorId, Long subscriberId, SubscriptionStatus status);

    Optional<Subscription> findTopByCreatorIdAndSubscriberIdOrderByExpiresAtDesc(Long creatorId, Long subscriberId);

    long countByCreatorIdAndStatus(Long creatorId, SubscriptionStatus status);
}

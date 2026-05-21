package com.example.Quora.repository;

import com.example.Quora.models.UserPaymentCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPaymentCredentialRepository extends JpaRepository<UserPaymentCredential, Long> {
    Optional<UserPaymentCredential> findByUserId(Long userId);
}

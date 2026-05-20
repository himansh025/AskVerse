package com.example.Quora.repository;

import com.example.Quora.models.Debate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DebateRepository extends JpaRepository<Debate, Long> {
    Optional<Debate> findByQuestionId(Long questionId);
}

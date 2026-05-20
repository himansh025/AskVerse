package com.example.Quora.repository;

import com.example.Quora.models.DebateVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DebateVoteRepository extends JpaRepository<DebateVote, Long> {
    Optional<DebateVote> findByDebateIdAndUserId(Long debateId, Long userId);
}

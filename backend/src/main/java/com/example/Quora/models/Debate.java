package com.example.Quora.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Debate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Question question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String proText;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String againstText;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

    @Column(nullable = false)
    private String aiProvider = "OPENAI"; // OPENAI or GEMINI

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "debate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<DebateVote> votes = new HashSet<>();

    public long getProVoteCount() {
        return votes.stream().filter(v -> "PRO".equals(v.getVote())).count();
    }

    public long getAgainstVoteCount() {
        return votes.stream().filter(v -> "AGAINST".equals(v.getVote())).count();
    }

    public long getTotalVotes() {
        return votes.size();
    }

    public double getProPercentage() {
        long total = getTotalVotes();
        if (total == 0) return 0;
        return Math.round((double) getProVoteCount() / total * 100 * 100) / 100.0;
    }

    public double getAgainstPercentage() {
        long total = getTotalVotes();
        if (total == 0) return 0;
        return Math.round((double) getAgainstVoteCount() / total * 100 * 100) / 100.0;
    }
}

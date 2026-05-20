package com.example.Quora.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"debate_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebateVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "debate_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Debate debate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false)
    private String vote; // PRO or AGAINST

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Custom constructor for 3 arguments (without id and createdAt)
    public DebateVote(Debate debate, User user, String vote) {
        this.debate = debate;
        this.user = user;
        this.vote = vote;
    }
}

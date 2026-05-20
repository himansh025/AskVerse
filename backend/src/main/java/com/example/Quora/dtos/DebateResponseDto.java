package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebateResponseDto {
    private Long id;
    private Long questionId;
    private String proText;
    private String againstText;
    private String summary;
    private String aiProvider;
    private LocalDateTime createdAt;
    private Long proVotes;
    private Long againstVotes;
    private Long totalVotes;
    private Double proPercentage;
    private Double againstPercentage;
    private String userVote; // PRO, AGAINST, or null if not voted
}

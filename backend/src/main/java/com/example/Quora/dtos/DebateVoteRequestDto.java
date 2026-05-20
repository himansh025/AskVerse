package com.example.Quora.dtos;

import lombok.Data;

@Data
public class DebateVoteRequestDto {
    private Long debateId;
    private Long userId;
    private String vote; // PRO or AGAINST
}

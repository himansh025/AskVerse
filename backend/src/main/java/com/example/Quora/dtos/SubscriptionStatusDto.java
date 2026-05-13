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
public class SubscriptionStatusDto {
    private Long creatorId;
    private Long subscriberId;
    private Boolean subscribed;
    private String status;
    private LocalDateTime expiresAt;
}

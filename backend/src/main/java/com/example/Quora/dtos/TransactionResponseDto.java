package com.example.Quora.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionResponseDto {
    private Long id;
    private String paymentReference;
    private BigDecimal amount;
    private String currency;
    private String status;

    // Subscriber info
    private Long subscriberId;
    private String subscriberName;
    private String subscriberEmail;

    // Creator info
    private Long creatorId;
    private String creatorName;
    private String creatorEmail;

    private LocalDateTime createdAt;
}

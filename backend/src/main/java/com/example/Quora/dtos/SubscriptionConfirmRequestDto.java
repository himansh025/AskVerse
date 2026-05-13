package com.example.Quora.dtos;

import lombok.Data;

@Data
public class SubscriptionConfirmRequestDto {
    private Long creatorId;
    private Long subscriberId;
    private String paymentReference;
    private String externalPaymentId;
    private String paymentGatewayOrderId;
    private String paymentSignature;
}

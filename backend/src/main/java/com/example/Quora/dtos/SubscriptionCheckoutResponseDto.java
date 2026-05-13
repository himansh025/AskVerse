package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCheckoutResponseDto {
    private String paymentReference;
    private String gateway;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String checkoutUrl;
    private String paymentGatewayOrderId;
    private String gatewayPublicKey;
    private String message;
}

package com.example.Quora.dtos;

import lombok.Data;

@Data
public class SubscriptionCheckoutRequestDto {
    private Long creatorId;
    private Long subscriberId;
    private String gateway;
}

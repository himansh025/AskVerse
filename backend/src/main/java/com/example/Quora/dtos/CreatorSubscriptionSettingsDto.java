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
public class CreatorSubscriptionSettingsDto {
    private Long creatorId;
    private String creatorName;
    private String creatorUsername;
    private Boolean premiumCreatorEnabled;
    private BigDecimal subscriptionPrice;
    private String subscriptionCurrency;
    private Long activeSubscriberCount;
    private BigDecimal monthlySubscriptionIncome;
    private Boolean subscribedByViewer;
}

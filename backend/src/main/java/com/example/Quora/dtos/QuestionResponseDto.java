package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponseDto {
    private Long id;
    private String title;
    private String content;
    private String previewContent;
    private Long authorId;
    private String username;
    private Set<String> tags;
    private String thumbnailUrl;
    private List<String> mediaUrls;
    private Boolean premiumContent;
    private String accessType;
    private Boolean locked;
    private Boolean accessible;
    private Boolean subscribeToUnlock;
    private java.math.BigDecimal subscriptionPrice;
    private String subscriptionCurrency;
    private LocalDateTime createdAt;
}

package com.example.Quora.dtos;

import lombok.Data;

import java.util.Set;

@Data
public class QuestionDto {
    private Long id;
    private String title;
    private String content;
    private String previewContent;
    private Boolean premiumContent;
    private String accessType;
    private Long userId;
    private Set<Long> tagIds;
    private Boolean isAnonymous = Boolean.FALSE;
}

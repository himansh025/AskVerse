package com.example.Quora.dtos;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class QuestionCreateRequestDto {
    private String title;
    private String content;
    private String previewContent;
    private Boolean premiumContent;
    private String accessType;
    private Long userId;
    private List<Long> tagIds;
    private List<MultipartFile> media;
}

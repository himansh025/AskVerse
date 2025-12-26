package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TagDetailsResponseDto {
    private Long id;
    private String name;
    private int followerCount;
    private int questionCount;
    private List<QuestionResponseDto> questions;
    private int currentPage;
    private int totalPages;
    private long totalQuestions;
}

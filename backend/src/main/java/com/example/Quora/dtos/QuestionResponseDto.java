package com.example.Quora.dtos;


import lombok.Data;
import java.util.Set;

@Data
public class QuestionResponseDto {
    private Long id;
    private String title;
    private String content;
    private String username;
    private Set<String> tags;
}
package com.example.Quora.dtos;


import lombok.Data;

@Data
public class AnswerDto {
    private Long id;
    private String content;
    private Long questionId;
    private Long userId;
}

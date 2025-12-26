package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerResponseDto {
    private Long id;
    private String content;
    private Long questionId;
    private UserBasicDto user;
    private int commentCount;
    private int likeCount;
}

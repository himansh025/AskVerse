package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDto {
    private Long id;
    private String content;
    private Long answerId;
    private Long parentCommentId;
    private UserBasicDto user;
    private int replyCount;
    private int likeCount;
}

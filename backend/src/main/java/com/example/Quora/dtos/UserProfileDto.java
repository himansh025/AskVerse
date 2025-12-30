package com.example.Quora.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.Quora.models.Tag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    private Long id;

    private String name;

    private String email;

    private String username;

    private String profilePicture;

    private String coverPicture;

    private String bio;

    private String location;

    private String website;

    private String gender;

    private LocalDate dob;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long followersCount;

    private Long followingCount;

    private List<QuestionResponseDto> questions;

    private Long questionsCount;

    private List<AnswerResponseDto> answers;

    private Long answersCount;

    private List<CommentResponseDto> comments;

    private Long commentsCount;

    private List<Tag> followedTags;

    private List<Tag> createdTags;

    // private Long likesCount;

    // private Long dislikesCount;

}

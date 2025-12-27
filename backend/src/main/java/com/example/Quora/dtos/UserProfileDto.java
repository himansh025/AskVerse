package com.example.Quora.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.Quora.models.Answer;
import com.example.Quora.models.Comment;
import com.example.Quora.models.Question;
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

    private List<Question> questions;

    private Long questionsCount;

    private List<Answer> answers;

    private Long answersCount;

    private List<Comment> comments;

    private Long commentsCount;

    private List<Tag> followedTags;

    private List<Tag> createdTags;

    // private Long likesCount;

    // private Long dislikesCount;

}

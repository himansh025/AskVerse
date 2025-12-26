package com.example.Quora.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@Data
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @ManyToOne
    @JoinColumn(name = "answer_id")
    @JsonIgnore
    private Answer answer;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    @JsonIgnore
    private Comment parentComment;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @OneToMany(mappedBy = "parentComment")
    @JsonIgnore
    private Set<Comment> replies = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "comment_likes", joinColumns = @JoinColumn(name = "comment_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonIgnore
    private Set<User> likedBy = new HashSet<>();
}
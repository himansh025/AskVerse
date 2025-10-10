package com.example.Quora.models;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@Builder
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    private  String name;

    @ManyToMany(mappedBy = "tags")
    private Set<Question> questions;

    @ManyToMany(mappedBy = "followedTags")
    private  Set<User> followers;

}

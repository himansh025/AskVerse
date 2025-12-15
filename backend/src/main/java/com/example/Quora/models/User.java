package com.example.Quora.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

@ManyToMany(fetch = FetchType.LAZY,
    cascade = { CascadeType.PERSIST, CascadeType.MERGE })
@JoinTable(
    name = "user_tags",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "tag_id")
)
@JsonIgnore
@ToString.Exclude
@EqualsAndHashCode.Exclude
private Set<Tag> followedTags = new HashSet<>();

}
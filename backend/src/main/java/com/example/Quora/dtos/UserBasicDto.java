package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserBasicDto {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String profilePicture;
}

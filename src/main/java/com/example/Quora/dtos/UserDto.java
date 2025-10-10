package com.example.Quora.dtos;

import com.example.Quora.models.User;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserDto {

        private  Long id;
        private String email;
        private String password;
        private String name;
        private String username;

    public static   UserDto from (User u){
        UserDto result= UserDto.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .password(u.getPassword())
                .username(u.getUsername())
                .build();
        return result;
    }
}


package com.example.Quora.dtos;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserDto {

        private String email;
        private String password;
        private String name;
        private String username;


}


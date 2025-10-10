package com.example.Quora.dtos;


import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserSignupDto {
    private String email;
    private String phoneNumber;
    private String password;
    private String name;

}

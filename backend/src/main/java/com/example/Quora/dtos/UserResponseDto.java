package com.example.Quora.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String profilePicture;
    private String coverPicture;
    private String bio;
    private String location;
    private String website;
    private String gender;
    private LocalDate dob;
    private Boolean premiumCreatorEnabled;
    private BigDecimal subscriptionPrice;
    private String subscriptionCurrency;
    private Long activeSubscriberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

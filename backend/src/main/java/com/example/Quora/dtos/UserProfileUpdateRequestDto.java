package com.example.Quora.dtos;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserProfileUpdateRequestDto {
    private String name;
    private String bio;
    private String location;
    private String website;
    private String gender;
    private String dob;
    private String coverPicture;
    private Boolean premiumCreatorEnabled;
    private String subscriptionPrice;
    private String subscriptionCurrency;
    private String razorpayPaymentDetails;
    private MultipartFile profileImage;
    private MultipartFile coverImage;
}

package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.UserDto;
import com.example.Quora.dtos.UserResponseDto;
import com.example.Quora.dtos.UserProfileDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.User;
import com.example.Quora.services.UserService;
import com.example.Quora.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private int expiryCookie = 24 * 7 * 3600;

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers()
                .stream()
                .map(userService::mapToUserResponseDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable("id") Long id) {
        UserResponseDto user = userService.getUserById(id)
                .map(userService::mapToUserResponseDto)
                .orElse(null);
        if (user != null) {
            return ResponseEntity.ok(ApiResponse.success("User found", user));
        }
        throw new ResourceNotFoundException("User not found with id: " + id);
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(@RequestBody UserDto userDTO) {
        User createdUser = userService.createUser(userDTO);
        UserResponseDto userResponse = userService.mapToUserResponseDto(createdUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", userResponse));
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<Map<String, String>>> signInUser(@RequestBody UserDto userDto,
            HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userDto.getEmail(), userDto.getPassword()));

            if (authentication.isAuthenticated()) {
                String jwtToken = jwtUtil.createToken(userDto.getEmail());
                ResponseCookie cookie = ResponseCookie.from("JwtToken", jwtToken)
                        .httpOnly(true)
                        .maxAge(expiryCookie)
                        .secure(false)
                        .build();
                response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                Map<String, String> tokenData = new HashMap<>();
                tokenData.put("token", jwtToken);

                return ResponseEntity.ok(ApiResponse.success("Login successful", tokenData));
            } else {
                throw new UsernameNotFoundException("Authentication failed");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserData(Authentication authentication) {
        String email = authentication.getName();
        System.out.println("email" + email);
        UserResponseDto user = userService.getUserByEmail(email)
                .map(userService::mapToUserResponseDto)
                .orElse(null);
        if (user != null) {
            return ResponseEntity.ok(ApiResponse.success("User data retrieved", user));
        }
        throw new ResourceNotFoundException("User not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PostMapping("/{userId}/followTag/{tagId}")
    public ResponseEntity<ApiResponse<Void>> followTag(@PathVariable("userId") Long userId,
            @PathVariable("tagId") Long tagId) {
        userService.followTag(userId, tagId);
        return ResponseEntity.ok(ApiResponse.success("Tag followed successfully", null));
    }

    @DeleteMapping("/{userId}/unfollowTag/{tagId}")
    public ResponseEntity<ApiResponse<Void>> unfollowTag(@PathVariable("userId") Long userId,
            @PathVariable("tagId") Long tagId) {
        userService.unfollowTag(userId, tagId);
        return ResponseEntity.ok(ApiResponse.success("Tag unfollowed successfully", null));
    }

    @GetMapping("/{userId}/followedTags")
    public ResponseEntity<ApiResponse<java.util.Set<com.example.Quora.models.Tag>>> getFollowedTags(
            @PathVariable("userId") Long userId) {
        java.util.Set<com.example.Quora.models.Tag> followedTags = userService.getFollowedTags(userId);
        return ResponseEntity.ok(ApiResponse.success("Followed tags retrieved successfully", followedTags));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@PathVariable("userId") Long userId) {
        UserProfileDto profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profile));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateProfile(
            @PathVariable("userId") Long userId,
            @RequestBody UserProfileDto profileDto) {
        User updatedUser = userService.updateUserProfile(userId, profileDto);
        UserResponseDto userResponse = userService.mapToUserResponseDto(updatedUser);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userResponse));
    }
}
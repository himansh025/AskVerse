package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.UserDto;
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
import java.util.Optional;
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
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("User found", user.get()));
        }
        throw new ResourceNotFoundException("User not found with id: " + id);
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody UserDto userDTO) {
        User createdUser = userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", createdUser));
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
    public ResponseEntity<ApiResponse<User>> getUserData(Authentication authentication) {
        String email = authentication.getName();
        System.out.println("email" + email);
        Optional<User> user = userService.getUserByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("User data retrieved", user.get()));
        }
        throw new ResourceNotFoundException("User not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
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
}
package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.services.UserFeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feed")
public class FeedController {

    private final UserFeedService userFeedService;

    public FeedController(UserFeedService userFeedService) {
        this.userFeedService = userFeedService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<QuestionResponseDto>>> getUserFeed(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Feed retrieved successfully",
                        userFeedService.getUserFeed(userId, page, size)));
    }
}

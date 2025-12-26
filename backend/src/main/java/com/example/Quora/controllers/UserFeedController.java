package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.services.UserFeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feed")
public class UserFeedController {
    @Autowired
    private UserFeedService userFeedService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<QuestionResponseDto>>> getUserFeed(
            @PathVariable("userId") Long userId,
            @RequestParam("page") int page,
            @RequestParam("size") int size) {
        List<QuestionResponseDto> feed = userFeedService.getUserFeed(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Feed retrieved successfully", feed));
    }
}
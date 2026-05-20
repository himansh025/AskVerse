package com.example.Quora.controllers;

import com.example.Quora.dtos.DebateResponseDto;
import com.example.Quora.dtos.DebateVoteRequestDto;
import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.services.DebateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/debates")
@CrossOrigin(origins = {"http://localhost:5173", "https://askverse-client.vercel.app"})
public class DebateController {

    private final DebateService debateService;

    public DebateController(DebateService debateService) {
        this.debateService = debateService;
    }

    @PostMapping("/generate/{questionId}")
    public ResponseEntity<ApiResponse<DebateResponseDto>> generateDebate(
            @PathVariable Long questionId) {
        DebateResponseDto debate = debateService.generateDebate(questionId);
        return ResponseEntity.ok(ApiResponse.success("Debate generated successfully", debate));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<ApiResponse<DebateResponseDto>> getDebate(
            @PathVariable Long questionId,
            @RequestParam(required = false) Long userId) {
        DebateResponseDto debate = debateService.getDebate(questionId, userId);
        return ResponseEntity.ok(ApiResponse.success("Debate retrieved successfully", debate));
    }

    @PostMapping("/vote")
    public ResponseEntity<ApiResponse<DebateResponseDto>> voteOnDebate(
            @RequestBody DebateVoteRequestDto request) {
        DebateResponseDto updated = debateService.voteOnDebate(
                request.getDebateId(),
                request.getUserId(),
                request.getVote()
        );
        return ResponseEntity.ok(ApiResponse.success("Vote recorded successfully", updated));
    }
}

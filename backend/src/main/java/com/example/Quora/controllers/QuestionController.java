package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.QuestionDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.services.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

        private final QuestionService questionService;

        public QuestionController(QuestionService questionService) {
                this.questionService = questionService;
        }

        @GetMapping("/all")
        public ResponseEntity<ApiResponse<List<QuestionResponseDto>>> getAllQuestions(
                        @RequestParam int page,
                        @RequestParam int size) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Questions retrieved successfully",
                                                questionService.getQuestions(page, size)));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<QuestionResponseDto>> getQuestionById(
                        @PathVariable("id") Long id) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Question retrieved successfully",
                                                questionService.getQuestionById(id)));
        }

        @GetMapping("/tag/{tagId}")
        public ResponseEntity<ApiResponse<List<QuestionResponseDto>>> getQuestionsByTag(
                        @PathVariable("tagId") Long tagId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Questions retrieved successfully",
                                                questionService.getQuestionsByTag(tagId, page, size)));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<QuestionResponseDto>> createQuestion(
                        @RequestBody QuestionDto dto) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                "Question created successfully",
                                                questionService.createQuestion(dto)));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable("id") Long id) {
                questionService.deleteQuestion(id);
                return ResponseEntity.ok(ApiResponse.success("Question deleted", null));
        }
}

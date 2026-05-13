package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.QuestionCreateRequestDto;
import com.example.Quora.dtos.QuestionDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.services.QuestionService;
import org.springframework.http.MediaType;
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
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size,
                        @RequestParam(name = "viewerUserId", required = false) Long viewerUserId) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Questions retrieved successfully",
                                                questionService.getQuestions(page, size, viewerUserId)));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<QuestionResponseDto>> getQuestionById(
                        @PathVariable("id") Long id,
                        @RequestParam(name = "viewerUserId", required = false) Long viewerUserId) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Question retrieved successfully",
                                                questionService.getQuestionById(id, viewerUserId)));
        }

        @GetMapping("/tag/{tagId}")
        public ResponseEntity<ApiResponse<List<QuestionResponseDto>>> getQuestionsByTag(
                        @PathVariable("tagId") Long tagId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(name = "viewerUserId", required = false) Long viewerUserId) {

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Questions retrieved successfully",
                                                questionService.getQuestionsByTag(tagId, page, size, viewerUserId)));
        }

        @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<ApiResponse<QuestionResponseDto>> createQuestion(
                        @RequestBody QuestionDto dto) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                "Question created successfully",
                                                questionService.createQuestion(dto)));
        }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<QuestionResponseDto>> createQuestionWithMedia(
                        @ModelAttribute QuestionCreateRequestDto dto) {
                QuestionDto questionDto = new QuestionDto();
                questionDto.setTitle(dto.getTitle());
                questionDto.setContent(dto.getContent());
                questionDto.setPreviewContent(dto.getPreviewContent());
                questionDto.setPremiumContent(dto.getPremiumContent());
                questionDto.setAccessType(dto.getAccessType());
                questionDto.setUserId(dto.getUserId());
                questionDto.setTagIds(dto.getTagIds() == null ? java.util.Set.of() : new java.util.HashSet<>(dto.getTagIds()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                "Question created successfully",
                                                questionService.createQuestion(questionDto, dto.getMedia())));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable("id") Long id) {
                questionService.deleteQuestion(id);
                return ResponseEntity.ok(ApiResponse.success("Question deleted", null));
        }
}

package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.QuestionDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.Question;
import com.example.Quora.services.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
        List<QuestionResponseDto> questions = questionService.getQuestions(page, size);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully", questions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Question>> getQuestionById(@PathVariable Long id) {
        Optional<Question> question = questionService.getQuestionById(id);
        if (question.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Question found", question.get()));
        }
        throw new ResourceNotFoundException("Question not found with id: " + id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Question>> createQuestion(@RequestBody QuestionDto questionDTO) {
        Question createdQuestion = questionService.createQuestion(questionDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", createdQuestion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    // @PutMapping("/{id}")
    // public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody
    // QuestionDto updateReq) {
    // try {
    // QuestionDto res = questionService.updateQuestion(id, updateReq);
    // return ResponseEntity.ok().body(res);
    // } catch (RuntimeException e) {
    // return ResponseEntity.status(HttpStatus.NOT_FOUND)
    // .body(Map.of("message", e.getMessage()));
    // }
    // }

}
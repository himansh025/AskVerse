package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.AnswerDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.Answer;
import com.example.Quora.services.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/answers")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @GetMapping("/question/{questionId}")
    public ResponseEntity<ApiResponse<List<Answer>>> getAnswersByQuestionId(
            @PathVariable Long questionId,
            @RequestParam int page,
            @RequestParam int size) {
        List<Answer> answers = answerService.getAnswersByQuestionId(questionId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Answers retrieved successfully", answers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Answer>> getAnswerById(@PathVariable Long id) {
        Optional<Answer> answer = answerService.getAnswerById(id);
        if (answer.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Answer found", answer.get()));
        }
        throw new ResourceNotFoundException("Answer not found with id: " + id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Answer>> createAnswer(@RequestBody AnswerDto answerDTO) {
        Answer createdAnswer = answerService.createAnswer(answerDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Answer created successfully", createdAnswer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnswer(@PathVariable Long id) {
        answerService.deleteAnswer(id);
        return ResponseEntity.ok(ApiResponse.success("Answer deleted successfully", null));
    }
}
package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.CommentDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.Comment;
import com.example.Quora.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/answer/{answerId}")
    public ResponseEntity<ApiResponse<List<Comment>>> getCommentsByAnswerId(
            @PathVariable Long answerId,
            @RequestParam int page,
            @RequestParam int size) {
        List<Comment> comments = commentService.getCommentsByAnswerId(answerId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", comments));
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<ApiResponse<List<Comment>>> getRepliesByCommentId(
            @PathVariable Long commentId,
            @RequestParam int page,
            @RequestParam int size) {
        List<Comment> replies = commentService.getRepliesByCommentId(commentId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Replies retrieved successfully", replies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Comment>> getCommentById(@PathVariable Long id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        if (comment.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Comment found", comment.get()));
        }
        throw new ResourceNotFoundException("Comment not found with id: " + id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Comment>> createComment(@RequestBody CommentDto commentDTO) {
        Comment createdComment = commentService.createComment(commentDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment created successfully", createdComment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }
}
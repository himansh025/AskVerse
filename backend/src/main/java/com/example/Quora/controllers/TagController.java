package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.TagDetailsResponseDto;
import com.example.Quora.dtos.TagDto;
import com.example.Quora.dtos.TagResponseDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.Tag;
import com.example.Quora.services.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponseDto>>> getAllTags() {
        List<TagResponseDto> tags = tagService.getAllTags();
        return ResponseEntity.ok(ApiResponse.success("Tags retrieved successfully", tags));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponseDto>> getTagById(@PathVariable("id") Long id) {
        TagResponseDto tag = tagService.getTagWithDetails(id);
        if (tag != null) {
            return ResponseEntity.ok(ApiResponse.success("Tag found", tag));
        }
        throw new ResourceNotFoundException("Tag not found with id: " + id);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<TagDetailsResponseDto>> getTagWithQuestions(
            @PathVariable("id") Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        TagDetailsResponseDto tagDetails = tagService.getTagDetailsWithQuestions(id, page, size);
        if (tagDetails != null) {
            return ResponseEntity.ok(ApiResponse.success("Tag details retrieved successfully", tagDetails));
        }
        throw new ResourceNotFoundException("Tag not found with id: " + id);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Tag>> createTag(@RequestBody TagDto tagDTO) {
        Tag createdTag = tagService.createTag(tagDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tag created successfully", createdTag));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok(ApiResponse.success("Tag deleted successfully", null));
    }
}
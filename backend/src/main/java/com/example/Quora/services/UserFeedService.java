package com.example.Quora.services;

import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.models.Question;
import com.example.Quora.models.Tag;
import com.example.Quora.models.User;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserFeedService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getUserFeed(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Long> tagIds = user.getFollowedTags().stream()
                .map(Tag::getId)
                .collect(Collectors.toSet());

        List<Question> questions;

        // If user has followed tags, show questions from those tags
        // Otherwise, show all questions
        if (tagIds.isEmpty()) {
            questions = questionRepository.findAll(PageRequest.of(page, size)).getContent();
        } else {
            questions = questionRepository.findQuestionsByTags(tagIds, PageRequest.of(page, size))
                    .getContent();
        }

        // Convert to DTOs
        return questions.stream()
                .map(q -> {
                    QuestionResponseDto dto = new QuestionResponseDto();
                    dto.setId(q.getId());
                    dto.setTitle(q.getTitle());
                    dto.setContent(q.getContent());
                    dto.setUsername(q.getUser() != null ? q.getUser().getUsername() : "Anonymous");
                    dto.setTags(q.getTags().stream().map(Tag::getName).collect(Collectors.toSet()));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}

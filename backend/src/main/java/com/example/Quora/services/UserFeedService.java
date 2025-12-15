package com.example.Quora.services;

import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.models.Question;
// import com.example.Quora.models.Tag;
// import com.example.Quora.models.User;
import com.example.Quora.repository.QuestionRepository;
// import com.example.Quora.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
// import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageRequest;

@Service
public class UserFeedService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionService questionService;

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getUserFeed(Long userId, int page, int size) {

        Page<Long> idPage =
                questionRepository.findQuestionIds(
                        PageRequest.of(page, size)
                );

        if (idPage.isEmpty()) return List.of();

        List<Question> questions =
                questionRepository.findWithUserAndTags(
                        new HashSet<>(idPage.getContent())
                );

        return questions.stream()
                .map(questionService::mapToDto)
                .toList();
    }
}


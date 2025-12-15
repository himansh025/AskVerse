package com.example.Quora.services;

import com.example.Quora.dtos.QuestionDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.Question;
import com.example.Quora.models.Tag;
import com.example.Quora.models.User;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.TagRepository;
import com.example.Quora.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            UserRepository userRepository,
            TagRepository tagRepository) {
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestions(int page, int size) {
        return questionRepository
                .findAllWithUserAndTags(PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public QuestionResponseDto createQuestion(QuestionDto dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<Tag> tags = tagRepository.findAllById(dto.getTagIds())
                .stream()
                .collect(Collectors.toSet());

        Question question = new Question();
        question.setTitle(dto.getTitle());
        question.setContent(dto.getContent());
        question.setUser(user);
        question.setTags(tags);

        Question saved = questionRepository.save(question);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    // 🔥 SAFE DTO MAPPER
    public QuestionResponseDto mapToDto(Question q) {
        return QuestionResponseDto.builder()
                .id(q.getId())
                .title(q.getTitle())
                .content(q.getContent())
                .username(
                        q.getUser() != null ? q.getUser().getUsername() : null)
                .tags(
                        q.getTags() == null
                                ? Set.of()
                                : q.getTags()
                                        .stream()
                                        .map(Tag::getName)
                                        .collect(Collectors.toSet()))
                .build();
    }
}

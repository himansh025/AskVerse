package com.example.Quora.services;

import com.example.Quora.dtos.QuestionDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.ContentAccessType;
import com.example.Quora.models.Question;
import com.example.Quora.models.Tag;
import com.example.Quora.models.User;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.TagRepository;
import com.example.Quora.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors; 

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final CloudinaryService cloudinaryService;
    private final SubscriptionService subscriptionService;

    public QuestionService(
            QuestionRepository questionRepository,
            UserRepository userRepository,
            TagRepository tagRepository,
            CloudinaryService cloudinaryService,
            SubscriptionService subscriptionService) {
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.cloudinaryService = cloudinaryService;
        this.subscriptionService = subscriptionService;
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestions(int page, int size) {
        return getQuestions(page, size, null);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestions(int page, int size, Long viewerId) {
        return questionRepository
                .findAllWithUserAndTags(PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(question -> mapToDto(question, viewerId))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionResponseDto getQuestionById(Long id) {
        return getQuestionById(id, null);
    }

    @Transactional(readOnly = true)
    public QuestionResponseDto getQuestionById(Long id, Long viewerId) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return mapToDto(question, viewerId);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestionsByTag(Long tagId, int page, int size) {
        return getQuestionsByTag(tagId, page, size, null);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestionsByTag(Long tagId, int page, int size, Long viewerId) {
        return questionRepository
                .findQuestionsByTagId(tagId, PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(question -> mapToDto(question, viewerId))
                .toList();
    }

    @Transactional
    public QuestionResponseDto createQuestion(QuestionDto dto) {
        return createQuestion(dto, List.of());
    }

    @Transactional
    public QuestionResponseDto createQuestion(QuestionDto dto, List<MultipartFile> mediaFiles) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(dto.getPremiumContent()) && !Boolean.TRUE.equals(user.getPremiumCreatorEnabled())) {
            throw new IllegalArgumentException("Enable creator subscriptions on your profile before posting premium content");
        }

        Set<Tag> tags = tagRepository.findAllById(dto.getTagIds())
                .stream()
                .collect(Collectors.toSet());

        Question question = new Question();
        question.setTitle(dto.getTitle());
        question.setContent(dto.getContent());
        question.setPreviewContent(resolvePreviewContent(dto));
        question.setPremiumContent(Boolean.TRUE.equals(dto.getPremiumContent()));
        question.setAccessType(resolveAccessType(dto));
        question.setIsAnonymous(Boolean.TRUE.equals(dto.getIsAnonymous()));
        question.setUser(user);
        question.setTags(tags);
        question.setMediaUrls(cloudinaryService.uploadImages(mediaFiles));

        Question saved = questionRepository.save(question);
        return mapToDto(saved, dto.getUserId());
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
        return mapToDto(q, null);
    }

    public QuestionResponseDto mapToDto(Question q, Long viewerId) {
        List<String> mediaUrls = q.getMediaUrls() == null ? List.of() : List.copyOf(q.getMediaUrls());
        boolean accessible = isQuestionAccessible(q, viewerId);
        boolean locked = Boolean.TRUE.equals(q.getPremiumContent()) && !accessible;
        User author = q.getUser();
        boolean isAnonymous = Boolean.TRUE.equals(q.getIsAnonymous());
        
        return QuestionResponseDto.builder()
                .id(q.getId())
                .title(q.getTitle())
                .content(accessible ? q.getContent() : resolvePreviewFromQuestion(q))
                .previewContent(resolvePreviewFromQuestion(q))
                .authorId(isAnonymous ? null : (author != null ? author.getId() : null))
                .username(isAnonymous ? "Anonymous User" : (author != null ? author.getUsername() : null))
                .tags(
                        q.getTags() == null
                                ? Set.of()
                                : q.getTags()
                                        .stream()
                                        .map(Tag::getName)
                                        .collect(Collectors.toSet()))
                .thumbnailUrl(mediaUrls.isEmpty() ? null : mediaUrls.get(0))
                .mediaUrls(mediaUrls)
                .premiumContent(Boolean.TRUE.equals(q.getPremiumContent()))
                .accessType((q.getAccessType() == null ? ContentAccessType.FREE : q.getAccessType()).name())
                .locked(locked)
                .accessible(accessible)
                .subscribeToUnlock(locked)
                .subscriptionPrice(author != null ? subscriptionService.resolveSubscriptionPrice(author) : null)
                .subscriptionCurrency(author != null ? subscriptionService.resolveSubscriptionCurrency(author) : null)
                .isAnonymous(isAnonymous)
                .createdAt(q.getCreatedAt())
                .build();
    }

    private ContentAccessType resolveAccessType(QuestionDto dto) {
        if (dto.getAccessType() == null || dto.getAccessType().isBlank()) {
            return Boolean.TRUE.equals(dto.getPremiumContent()) ? ContentAccessType.PREMIUM : ContentAccessType.FREE;
        }

        try {
            return ContentAccessType.valueOf(dto.getAccessType().trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            return Boolean.TRUE.equals(dto.getPremiumContent()) ? ContentAccessType.PREMIUM : ContentAccessType.FREE;
        }
    }

    private String resolvePreviewContent(QuestionDto dto) {
        if (dto.getPreviewContent() != null && !dto.getPreviewContent().isBlank()) {
            return dto.getPreviewContent().trim();
        }
        if (dto.getContent() == null) {
            return "";
        }

        String trimmed = dto.getContent().trim();
        return trimmed.length() <= 220 ? trimmed : trimmed.substring(0, 220) + "...";
    }

    private String resolvePreviewFromQuestion(Question question) {
        if (question.getPreviewContent() != null && !question.getPreviewContent().isBlank()) {
            return question.getPreviewContent();
        }
        if (question.getContent() == null) {
            return "";
        }

        String trimmed = question.getContent().trim();
        return trimmed.length() <= 220 ? trimmed : trimmed.substring(0, 220) + "...";
    }

    private boolean isQuestionAccessible(Question question, Long viewerId) {
        if (!Boolean.TRUE.equals(question.getPremiumContent())
                || question.getAccessType() == null
                || question.getAccessType() == ContentAccessType.FREE) {
            return true;
        }

        if (question.getUser() == null) {
            return false;
        }

        return subscriptionService.hasActiveSubscription(viewerId, question.getUser().getId());
    }
}

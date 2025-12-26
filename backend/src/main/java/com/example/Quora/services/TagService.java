package com.example.Quora.services;

import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.dtos.TagDetailsResponseDto;
import com.example.Quora.dtos.TagDto;
import com.example.Quora.dtos.TagResponseDto;
import com.example.Quora.models.Tag;
import com.example.Quora.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TagService {
    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private QuestionService questionService;

    public List<TagResponseDto> getAllTags() {
        List<Tag> tags = tagRepository.findAll();
        return tags.stream()
                .map(tag -> new TagResponseDto(
                        tag.getId(),
                        tag.getName(),
                        tag.getFollowers() != null ? tag.getFollowers().size() : 0,
                        tag.getQuestions() != null ? tag.getQuestions().size() : 0))
                .collect(Collectors.toList());
    }

    public Optional<Tag> getTagById(Long id) {
        return tagRepository.findById(id);
    }

    public TagResponseDto getTagWithDetails(Long id) {
        Optional<Tag> tagOpt = tagRepository.findById(id);
        if (tagOpt.isEmpty()) {
            return null;
        }
        Tag tag = tagOpt.get();
        return new TagResponseDto(
                tag.getId(),
                tag.getName(),
                tag.getFollowers() != null ? tag.getFollowers().size() : 0,
                tag.getQuestions() != null ? tag.getQuestions().size() : 0);
    }

    public TagDetailsResponseDto getTagDetailsWithQuestions(Long id, int page, int size) {
        Optional<Tag> tagOpt = tagRepository.findById(id);
        if (tagOpt.isEmpty()) {
            return null;
        }

        Tag tag = tagOpt.get();
        List<QuestionResponseDto> questions = questionService.getQuestionsByTag(id, page, size);

        // Get total count for pagination
        int totalQuestions = tag.getQuestions() != null ? tag.getQuestions().size() : 0;
        int totalPages = (int) Math.ceil((double) totalQuestions / size);

        return new TagDetailsResponseDto(
                tag.getId(),
                tag.getName(),
                tag.getFollowers() != null ? tag.getFollowers().size() : 0,
                totalQuestions,
                questions,
                page,
                totalPages,
                totalQuestions);
    }

    public Tag createTag(TagDto tagDTO) {
        Tag tag = new Tag();
        tag.setName(tagDTO.getName());
        return tagRepository.save(tag);
    }

    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }
}

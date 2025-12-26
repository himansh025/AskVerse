package com.example.Quora.services;

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

    public Tag createTag(TagDto tagDTO) {
        Tag tag = new Tag();
        tag.setName(tagDTO.getName());
        return tagRepository.save(tag);
    }

    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }
}

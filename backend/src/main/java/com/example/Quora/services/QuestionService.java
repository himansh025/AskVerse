package com.example.Quora.services;

import com.example.Quora.dtos.QuestionDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.models.Question;
import com.example.Quora.models.Tag;
import com.example.Quora.models.User;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.TagRepository;
import com.example.Quora.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuestions(int page, int size) {
        return questionRepository.findAll(PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(q -> {
                    QuestionResponseDto dto = new QuestionResponseDto();
                    dto.setId(q.getId());
                    dto.setTitle(q.getTitle());
                    dto.setContent(q.getContent());
                    dto.setUsername(q.getUser() != null ? q.getUser().getUsername() : "Anonymous");
                    dto.setTags(q.getTags().stream().map(Tag::getName).collect(Collectors.toSet()));
                    return dto;
                })
                .toList();
    }

    public Optional<Question> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    public Question createQuestion(QuestionDto questionDTO) {
        Question question = new Question();
        question.setTitle(questionDTO.getTitle());
        question.setContent(questionDTO.getContent());

        Optional<User> user = userRepository.findById(questionDTO.getUserId());
        user.ifPresent(question::setUser);

        Set<Tag> tags = questionDTO.getTagIds().stream()
                .map(tagRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
        question.setTags(tags);

        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}
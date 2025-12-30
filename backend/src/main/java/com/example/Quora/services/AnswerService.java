package com.example.Quora.services;

import com.example.Quora.dtos.AnswerDto;
import com.example.Quora.dtos.AnswerResponseDto;
import com.example.Quora.dtos.UserBasicDto;
import com.example.Quora.models.Answer;
import com.example.Quora.models.Question;
import com.example.Quora.models.User;
import com.example.Quora.repository.AnswerRepository;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnswerService {
    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AnswerResponseDto> getAnswersByQuestionId(Long questionId, int page, int size) {
        List<Answer> answers = answerRepository.findByQuestionId(questionId, PageRequest.of(page, size)).getContent();
        return answers.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public Optional<Answer> getAnswerById(Long id) {
        return answerRepository.findById(id);
    }

    public AnswerResponseDto createAnswer(AnswerDto answerDTO) {
        Answer answer = new Answer();
        answer.setContent(answerDTO.getContent());

        Optional<Question> question = questionRepository.findById(answerDTO.getQuestionId());
        question.ifPresent(answer::setQuestion);

        Optional<User> user = userRepository.findById(answerDTO.getUserId());
        user.ifPresent(answer::setUser);

        Answer savedAnswer = answerRepository.save(answer);
        return convertToResponseDto(savedAnswer);
    }

    public void deleteAnswer(Long id) {
        answerRepository.deleteById(id);
    }

    public AnswerResponseDto convertToResponseDto(Answer answer) {
        UserBasicDto userDto = null;
        if (answer.getUser() != null) {
            User user = answer.getUser();
            userDto = new UserBasicDto(user.getId(), user.getName(), user.getUsername(), user.getEmail(),
                    user.getProfilePicture());
        }

        return new AnswerResponseDto(
                answer.getId(),
                answer.getContent(),
                answer.getQuestion() != null ? answer.getQuestion().getId() : null,
                userDto,
                answer.getComments() != null ? answer.getComments().size() : 0,
                answer.getLikedBy() != null ? answer.getLikedBy().size() : 0);
    }
}
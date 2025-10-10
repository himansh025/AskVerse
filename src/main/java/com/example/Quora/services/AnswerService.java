package com.example.Quora.services;

import com.example.Quora.dtos.AnswerDto;
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

@Service
public class AnswerService {
    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Answer> getAnswersByQuestionId(Long questionId, int page, int size) {
        return answerRepository.findByQuestionId(questionId, PageRequest.of(page, size)).getContent();
    }

    public Optional<Answer> getAnswerById(Long id) {
        return answerRepository.findById(id);
    }

    public Answer createAnswer(AnswerDto answerDTO) {
        Answer answer = new Answer();
        answer.setContent(answerDTO.getContent());

        Optional<Question> question = questionRepository.findById(answerDTO.getQuestionId());
        question.ifPresent(answer::setQuestion);

        Optional<User> user = userRepository.findById(answerDTO.getUserId());
        user.ifPresent(answer::setUser);

        return answerRepository.save(answer);
    }

    public void deleteAnswer(Long id) {
        answerRepository.deleteById(id);
    }
}
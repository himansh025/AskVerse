package com.example.Quora.services;

import com.example.Quora.dtos.CommentDto;
import com.example.Quora.models.Answer;
import com.example.Quora.models.Comment;
import com.example.Quora.repository.AnswerRepository;
import com.example.Quora.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

        @Autowired
        private CommentRepository commentRepository;

        @Autowired
        private AnswerRepository answerRepository;

        public List<Comment> getCommentsByAnswerId(Long answerId, int page, int size) {
            return commentRepository.findByAnswerId(answerId, PageRequest.of(page, size)).getContent();
        }

        public List<Comment> getRepliesByCommentId(Long commentId, int page, int size) {
            return commentRepository.findByParentCommentId(commentId, PageRequest.of(page, size)).getContent();
        }

        public Optional<Comment> getCommentById(Long id) {
            return commentRepository.findById(id);
        }

        public Comment createComment(CommentDto commentDTO) {
            Comment comment = new Comment();
            comment.setContent(commentDTO.getContent());

            Optional<Answer> answer = answerRepository.findById(commentDTO.getAnswerId());
            if (answer.isPresent()){
                comment.setContent(String.valueOf(answer));
            }

            if (commentDTO.getParentCommentId() != null) {
                Optional<Comment> parentComment = commentRepository.findById(commentDTO.getParentCommentId());
                parentComment.ifPresent(comment::setParentComment);
            }

            return commentRepository.save(comment);
        }

        public void deleteComment(Long id) {
            commentRepository.deleteById(id);
        }
    }


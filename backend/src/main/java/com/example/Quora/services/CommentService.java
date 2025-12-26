package com.example.Quora.services;

import com.example.Quora.dtos.CommentDto;
import com.example.Quora.dtos.CommentResponseDto;
import com.example.Quora.dtos.UserBasicDto;
import com.example.Quora.models.Answer;
import com.example.Quora.models.Comment;
import com.example.Quora.models.User;
import com.example.Quora.repository.AnswerRepository;
import com.example.Quora.repository.CommentRepository;
import com.example.Quora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommentResponseDto> getCommentsByAnswerId(Long answerId, int page, int size) {
        List<Comment> comments = commentRepository.findByAnswerId(answerId, PageRequest.of(page, size)).getContent();
        return comments.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public List<CommentResponseDto> getRepliesByCommentId(Long commentId, int page, int size) {
        List<Comment> replies = commentRepository.findByParentCommentId(commentId, PageRequest.of(page, size))
                .getContent();
        return replies.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    public CommentResponseDto createComment(CommentDto commentDTO) {
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());

        Optional<Answer> answer = answerRepository.findById(commentDTO.getAnswerId());
        answer.ifPresent(comment::setAnswer);

        Optional<User> user = userRepository.findById(commentDTO.getUserId());
        user.ifPresent(comment::setUser);

        if (commentDTO.getParentCommentId() != null) {
            Optional<Comment> parentComment = commentRepository.findById(commentDTO.getParentCommentId());
            parentComment.ifPresent(comment::setParentComment);
        }

        Comment savedComment = commentRepository.save(comment);
        return convertToResponseDto(savedComment);
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    private CommentResponseDto convertToResponseDto(Comment comment) {
        UserBasicDto userDto = null;
        if (comment.getUser() != null) {
            User user = comment.getUser();
            userDto = new UserBasicDto(user.getId(), user.getName(), user.getUsername(), user.getEmail());
        }

        return new CommentResponseDto(
                comment.getId(),
                comment.getContent(),
                comment.getAnswer() != null ? comment.getAnswer().getId() : null,
                comment.getParentComment() != null ? comment.getParentComment().getId() : null,
                userDto,
                comment.getReplies() != null ? comment.getReplies().size() : 0,
                comment.getLikedBy() != null ? comment.getLikedBy().size() : 0);
    }
}

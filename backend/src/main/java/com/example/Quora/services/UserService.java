package com.example.Quora.services;

import com.example.Quora.dtos.UserDto;
import com.example.Quora.dtos.UserResponseDto;
import com.example.Quora.dtos.UserProfileDto;
import com.example.Quora.dtos.QuestionResponseDto;
import com.example.Quora.dtos.AnswerResponseDto;
import com.example.Quora.dtos.CommentResponseDto;
import com.example.Quora.models.Tag;
import com.example.Quora.models.User;
import com.example.Quora.repository.TagRepository;
import com.example.Quora.repository.UserRepository;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.AnswerRepository;
import com.example.Quora.repository.CommentRepository;
import com.example.Quora.services.QuestionService;
import com.example.Quora.services.AnswerService;
import com.example.Quora.services.CommentService;

import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public void followTag(Long userId, Long tagId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Tag tag = tagRepository.findById(tagId).orElseThrow(() -> new RuntimeException("Tag not found"));
        user.getFollowedTags().add(tag);
        userRepository.save(user);
    }

    public void unfollowTag(Long userId, Long tagId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Tag tag = tagRepository.findById(tagId).orElseThrow(() -> new RuntimeException("Tag not found"));
        user.getFollowedTags().remove(tag);
        userRepository.save(user);
    }

    public java.util.Set<Tag> getFollowedTags(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFollowedTags();
    }

    public User createUser(UserDto userDTO) {
        String hashedPassword = passwordEncoder.encode(userDTO.getPassword());
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setName(userDTO.getName());
        user.setPassword(hashedPassword);
        user.setProfilePicture(null);
        user.setCoverPicture(null);
        user.setBio(null);
        user.setLocation(null);
        user.setWebsite(null);
        user.setGender(null);
        user.setDob(null);

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Mapper methods to convert User to DTOs
    public UserResponseDto mapToUserResponseDto(User user) {
        if (user == null) {
            return null;
        }
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .coverPicture(user.getCoverPicture())
                .bio(user.getBio())
                .location(user.getLocation())
                .website(user.getWebsite())
                .gender(user.getGender())
                .dob(user.getDob())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's questions
        List<QuestionResponseDto> questions = questionRepository.findAll()
                .stream()
                .filter(q -> q.getUser() != null && q.getUser().getId().equals(userId))
                .map(questionService::mapToDto)
                .collect(Collectors.toList());

        // Get user's answers
        List<AnswerResponseDto> answers = answerRepository.findAll()
                .stream()
                .filter(a -> a.getUser() != null && a.getUser().getId().equals(userId))
                .map(answer -> answerService.convertToResponseDto(answer))
                .collect(Collectors.toList());

        // Get user's comments
        List<CommentResponseDto> comments = commentRepository.findAll()
                .stream()
                .filter(c -> c.getUser() != null && c.getUser().getId().equals(userId))
                .map(comment -> commentService.convertToResponseDto(comment))
                .collect(Collectors.toList());

        // Get followed tags
        List<Tag> followedTags = user.getFollowedTags()
                .stream()
                .collect(Collectors.toList());

        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .coverPicture(user.getCoverPicture())
                .bio(user.getBio())
                .location(user.getLocation())
                .website(user.getWebsite())
                .gender(user.getGender())
                .dob(user.getDob())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .questions(questions)
                .questionsCount((long) questions.size())
                .answers(answers)
                .answersCount((long) answers.size())
                .comments(comments)
                .commentsCount((long) comments.size())
                .followedTags(followedTags)
                .createdTags(null) // TODO: implement if needed
                .build();
    }

    public User updateUserProfile(Long userId, UserProfileDto profileDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only non-null fields
        if (profileDto.getName() != null)
            user.setName(profileDto.getName());
        if (profileDto.getBio() != null)
            user.setBio(profileDto.getBio());
        if (profileDto.getLocation() != null)
            user.setLocation(profileDto.getLocation());
        if (profileDto.getWebsite() != null)
            user.setWebsite(profileDto.getWebsite());
        if (profileDto.getGender() != null)
            user.setGender(profileDto.getGender());
        if (profileDto.getDob() != null)
            user.setDob(profileDto.getDob());
        if (profileDto.getProfilePicture() != null)
            user.setProfilePicture(profileDto.getProfilePicture());
        if (profileDto.getCoverPicture() != null)
            user.setCoverPicture(profileDto.getCoverPicture());

        return userRepository.save(user);
    }
}
package com.example.Quora.services;

import com.example.Quora.dtos.TransactionResponseDto;
import com.example.Quora.dtos.UserResponseDto;
import com.example.Quora.models.PaymentTransaction;
import com.example.Quora.repository.CommentRepository;
import com.example.Quora.repository.PaymentTransactionRepository;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.TagRepository;
import com.example.Quora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;
    
    @Autowired
    private UserService userService;

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    private static final String RAZORPAY_ORDER_API = "https://api.razorpay.com/v1/orders";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalComments", commentRepository.count());
        stats.put("totalTags", tagRepository.count());
        
        List<PaymentTransaction> transactions = paymentTransactionRepository.findAll();
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus().name()) || "SUCCESS".equals(t.getStatus().name()) || "PAID".equals(t.getStatus().name()))
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        stats.put("totalIncome", totalIncome);
        return stats;
    }

    public List<TransactionResponseDto> getAllTransactions() {
        return paymentTransactionRepository.findAll().stream()
                .map(t -> {
                    TransactionResponseDto dto = new TransactionResponseDto();
                    dto.setId(t.getId());
                    dto.setPaymentReference(t.getPaymentReference());
                    dto.setAmount(t.getAmount());
                    dto.setCurrency(t.getCurrency());
                    dto.setStatus(t.getStatus().name());
                    dto.setCreatedAt(t.getCreatedAt());

                    if (t.getSubscriber() != null) {
                        dto.setSubscriberId(t.getSubscriber().getId());
                        dto.setSubscriberName(t.getSubscriber().getName());
                        dto.setSubscriberEmail(t.getSubscriber().getEmail());
                    }
                    if (t.getCreator() != null) {
                        dto.setCreatorId(t.getCreator().getId());
                        dto.setCreatorName(t.getCreator().getName());
                        dto.setCreatorEmail(t.getCreator().getEmail());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
                .map(userService::mapToUserResponseDto)
                .collect(Collectors.toList());
    }

    @Autowired
    private com.example.Quora.repository.AnswerRepository answerRepository;

    @Transactional
    public void deleteUser(Long id) {
        com.example.Quora.models.User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            // Nullify creator and subscriber in payments
            List<PaymentTransaction> transactions = paymentTransactionRepository.findAll();
            for (PaymentTransaction t : transactions) {
                if (t.getCreator() != null && t.getCreator().getId().equals(id)) t.setCreator(null);
                if (t.getSubscriber() != null && t.getSubscriber().getId().equals(id)) t.setSubscriber(null);
            }
            
            // Delete user's comments
            List<com.example.Quora.models.Comment> userComments = commentRepository.findAll().stream()
                .filter(c -> c.getUser() != null && c.getUser().getId().equals(id))
                .collect(Collectors.toList());
            commentRepository.deleteAll(userComments);
            
            // Delete user's answers
            List<com.example.Quora.models.Answer> userAnswers = answerRepository.findAll().stream()
                .filter(a -> a.getUser() != null && a.getUser().getId().equals(id))
                .collect(Collectors.toList());
            answerRepository.deleteAll(userAnswers);
            
            // Delete user's questions
            List<com.example.Quora.models.Question> userQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getUser() != null && q.getUser().getId().equals(id))
                .collect(Collectors.toList());
            questionRepository.deleteAll(userQuestions);

            userRepository.deleteById(id);
        }
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Transactional
    public void deleteTag(Long id) {
        com.example.Quora.models.Tag tag = tagRepository.findById(id).orElse(null);
        if (tag != null) {
            for (com.example.Quora.models.Question question : tag.getQuestions()) {
                question.getTags().remove(tag);
            }
            tagRepository.deleteById(id);
        }
    }

    @Transactional
    public Map<String, Object> payoutUser(Long id, BigDecimal amount) {
        com.example.Quora.models.User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getPaymentCredential() == null || user.getPaymentCredential().getRazorpayPaymentDetails() == null || user.getPaymentCredential().getRazorpayPaymentDetails().isBlank()) {
            throw new IllegalArgumentException("User has not set up Razorpay payment credentials");
        }

        String paymentReference = "payout_" + java.util.UUID.randomUUID().toString().replace("-", "");
        String orderId = createRazorpayOrder(amount, "INR", paymentReference);

        com.example.Quora.models.User admin = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                .findFirst()
                .orElse(user);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setCreator(user);
        transaction.setSubscriber(admin);
        transaction.setAmount(amount);
        transaction.setCurrency("INR");
        transaction.setGateway(com.example.Quora.models.PaymentGateway.RAZORPAY);
        transaction.setPaymentReference(paymentReference);
        transaction.setPaymentGatewayOrderId(orderId);
        transaction.setStatus(com.example.Quora.models.PaymentStatus.PENDING);
        
        paymentTransactionRepository.save(transaction);

        Map<String, Object> orderDetails = new HashMap<>();
        orderDetails.put("orderId", orderId);
        orderDetails.put("amount", amount);
        orderDetails.put("currency", "INR");
        orderDetails.put("key", razorpayKeyId);
        orderDetails.put("paymentReference", paymentReference);
        return orderDetails;
    }

    @Transactional
    public void confirmPayout(String paymentReference, String externalPaymentId, String paymentSignature) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        transaction.setExternalPaymentId(externalPaymentId);
        transaction.setStatus(com.example.Quora.models.PaymentStatus.PAID);
        paymentTransactionRepository.save(transaction);
    }

    private String createRazorpayOrder(BigDecimal amount, String currency, String receipt) {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured");
        }
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).setScale(0, java.math.RoundingMode.HALF_UP).longValueExact();

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "amount", amountInPaise,
                    "currency", currency,
                    "receipt", receipt,
                    "payment_capture", 1));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RAZORPAY_ORDER_API))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + Base64.getEncoder().encodeToString(
                            (razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8)))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 && response.statusCode() != 201) {
                throw new IllegalStateException("Failed to create Razorpay order: " + response.body());
            }

            JsonNode responseBody = objectMapper.readTree(response.body());
            return responseBody.path("id").asText();
        } catch (java.io.IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Unable to create Razorpay order", ex);
        }
    }
}

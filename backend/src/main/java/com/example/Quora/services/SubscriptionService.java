package com.example.Quora.services;

import com.example.Quora.dtos.CreatorSubscriptionSettingsDto;
import com.example.Quora.dtos.SubscriptionCheckoutRequestDto;
import com.example.Quora.dtos.SubscriptionCheckoutResponseDto;
import com.example.Quora.dtos.SubscriptionConfirmRequestDto;
import com.example.Quora.dtos.SubscriptionStatusDto;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.example.Quora.models.PaymentGateway;
import com.example.Quora.models.PaymentStatus;
import com.example.Quora.models.PaymentTransaction;
import com.example.Quora.models.Subscription;
import com.example.Quora.models.SubscriptionStatus;
import com.example.Quora.models.User;
import com.example.Quora.repository.PaymentTransactionRepository;
import com.example.Quora.repository.SubscriptionRepository;
import com.example.Quora.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.util.Map;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

@Service
public class SubscriptionService {

    private static final int SUBSCRIPTION_DAYS = 30;
    private static final String RAZORPAY_ORDER_API = "https://api.razorpay.com/v1/orders";

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.subscription.default-currency:INR}")
    private String defaultCurrency;

    @Value("${app.payment.default-gateway:RAZORPAY}")
    private String defaultPaymentGateway;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public boolean hasActiveSubscription(Long subscriberId, Long creatorId) {
        if (subscriberId == null || creatorId == null) {
            return false;
        }
        if (subscriberId.equals(creatorId)) {
            return true;
        }

        return subscriptionRepository.findTopByCreatorIdAndSubscriberIdOrderByExpiresAtDesc(creatorId, subscriberId)
                .filter(subscription -> subscription.getStatus() == SubscriptionStatus.ACTIVE)
                .filter(subscription -> subscription.getExpiresAt() != null && subscription.getExpiresAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }

    @Transactional(readOnly = true)
    public CreatorSubscriptionSettingsDto getCreatorSettings(Long creatorId, Long viewerId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));
        long activeSubscriberCount = subscriptionRepository.countByCreatorIdAndStatus(creatorId, SubscriptionStatus.ACTIVE);

        return CreatorSubscriptionSettingsDto.builder()
                .creatorId(creator.getId())
                .creatorName(creator.getName())
                .creatorUsername(creator.getUsername())
                .premiumCreatorEnabled(Boolean.TRUE.equals(creator.getPremiumCreatorEnabled()))
                .subscriptionPrice(resolveSubscriptionPrice(creator))
                .subscriptionCurrency(resolveSubscriptionCurrency(creator))
                .activeSubscriberCount(activeSubscriberCount)
                .monthlySubscriptionIncome(calculateMonthlySubscriptionIncome(creator, activeSubscriberCount))
                .subscribedByViewer(hasActiveSubscription(viewerId, creatorId))
                .build();
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusDto getSubscriptionStatus(Long creatorId, Long subscriberId) {
        return subscriptionRepository.findTopByCreatorIdAndSubscriberIdOrderByExpiresAtDesc(creatorId, subscriberId)
                .map(subscription -> SubscriptionStatusDto.builder()
                        .creatorId(creatorId)
                        .subscriberId(subscriberId)
                        .subscribed(subscription.getStatus() == SubscriptionStatus.ACTIVE
                                && subscription.getExpiresAt() != null
                                && subscription.getExpiresAt().isAfter(LocalDateTime.now()))
                        .status(subscription.getStatus().name())
                        .expiresAt(subscription.getExpiresAt())
                        .build())
                .orElse(SubscriptionStatusDto.builder()
                        .creatorId(creatorId)
                        .subscriberId(subscriberId)
                        .subscribed(false)
                        .status(SubscriptionStatus.EXPIRED.name())
                        .expiresAt(null)
                        .build());
    }

    @Transactional
    public SubscriptionCheckoutResponseDto createCheckout(SubscriptionCheckoutRequestDto request) {
        User creator = userRepository.findById(request.getCreatorId())
                .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));
        User subscriber = userRepository.findById(request.getSubscriberId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscriber not found"));

        if (creator.getId().equals(subscriber.getId())) {
            throw new IllegalArgumentException("Creators cannot subscribe to themselves");
        }
        if (!Boolean.TRUE.equals(creator.getPremiumCreatorEnabled())) {
            throw new IllegalArgumentException("This creator has not enabled subscriptions");
        }
        if (hasActiveSubscription(subscriber.getId(), creator.getId())) {
            throw new IllegalArgumentException("You already have an active subscription");
        }

        PaymentGateway gateway = resolveGateway(request.getGateway());
        BigDecimal amount = resolveSubscriptionPrice(creator);
        String currency = resolveSubscriptionCurrency(creator);
        String paymentReference = "sub_" + UUID.randomUUID().toString().replace("-", "");

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setCreator(creator);
        transaction.setSubscriber(subscriber);
        transaction.setGateway(gateway);
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setAmount(amount);
        transaction.setCurrency(currency);
        transaction.setPaymentReference(paymentReference);

        if (gateway == PaymentGateway.RAZORPAY) {
            String paymentGatewayOrderId = createRazorpayOrder(amount, currency, paymentReference);
            transaction.setPaymentGatewayOrderId(paymentGatewayOrderId);
            transaction.setCheckoutUrl(null);
        } else {
            transaction.setCheckoutUrl("/subscribe/checkout/" + paymentReference);
        }

        paymentTransactionRepository.save(transaction);

        return SubscriptionCheckoutResponseDto.builder()
                .paymentReference(paymentReference)
                .gateway(gateway.name())
                .status(PaymentStatus.PENDING.name())
                .amount(amount)
                .currency(currency)
                .checkoutUrl(transaction.getCheckoutUrl())
                .paymentGatewayOrderId(transaction.getPaymentGatewayOrderId())
                .gatewayPublicKey(gateway == PaymentGateway.RAZORPAY ? razorpayKeyId : null)
                .message(gateway == PaymentGateway.RAZORPAY
                        ? "Razorpay checkout created. Complete payment in the modal."
                        : "Checkout created. Confirm the payment to activate the subscription.")
                .build();
    }

    @Transactional
    public SubscriptionStatusDto confirmCheckout(SubscriptionConfirmRequestDto request) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentReference(request.getPaymentReference())
                .orElseThrow(() -> new ResourceNotFoundException("Payment reference not found"));

        if (transaction.getStatus() == PaymentStatus.PAID && transaction.getSubscription() != null) {
            Subscription existingSubscription = transaction.getSubscription();
            return SubscriptionStatusDto.builder()
                    .creatorId(existingSubscription.getCreator().getId())
                    .subscriberId(existingSubscription.getSubscriber().getId())
                    .subscribed(existingSubscription.getStatus() == SubscriptionStatus.ACTIVE
                            && existingSubscription.getExpiresAt() != null
                            && existingSubscription.getExpiresAt().isAfter(LocalDateTime.now()))
                    .status(existingSubscription.getStatus().name())
                    .expiresAt(existingSubscription.getExpiresAt())
                    .build();
        }

        if (!transaction.getCreator().getId().equals(request.getCreatorId())
                || !transaction.getSubscriber().getId().equals(request.getSubscriberId())) {
            throw new IllegalArgumentException("Payment details do not match the checkout session");
        }

        if (transaction.getGateway() == PaymentGateway.RAZORPAY) {
            if (request.getPaymentGatewayOrderId() == null || request.getPaymentGatewayOrderId().isBlank()
                    || request.getPaymentSignature() == null || request.getPaymentSignature().isBlank()
                    || request.getExternalPaymentId() == null || request.getExternalPaymentId().isBlank()) {
                throw new IllegalArgumentException("Razorpay payment details are required for confirmation");
            }
            if (!request.getPaymentGatewayOrderId().equals(transaction.getPaymentGatewayOrderId())) {
                throw new IllegalArgumentException("Payment gateway order mismatch");
            }
            verifyRazorpaySignature(request.getPaymentGatewayOrderId(), request.getExternalPaymentId(), request.getPaymentSignature());
        }

        LocalDateTime now = LocalDateTime.now();
        Subscription subscription = subscriptionRepository
                .findTopByCreatorIdAndSubscriberIdOrderByExpiresAtDesc(request.getCreatorId(), request.getSubscriberId())
                .orElseGet(Subscription::new);

        subscription.setCreator(transaction.getCreator());
        subscription.setSubscriber(transaction.getSubscriber());
        subscription.setPaymentGateway(transaction.getGateway());
        subscription.setAmount(transaction.getAmount());
        subscription.setCurrency(transaction.getCurrency());
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        LocalDateTime nextStart = subscription.getExpiresAt() != null && subscription.getExpiresAt().isAfter(now)
                ? subscription.getExpiresAt()
                : now;
        subscription.setStartedAt(now);
        subscription.setExpiresAt(nextStart.plusDays(SUBSCRIPTION_DAYS));

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        transaction.setExternalPaymentId(request.getExternalPaymentId());
        transaction.setStatus(PaymentStatus.PAID);
        transaction.setSubscription(savedSubscription);
        paymentTransactionRepository.save(transaction);

        return SubscriptionStatusDto.builder()
                .creatorId(savedSubscription.getCreator().getId())
                .subscriberId(savedSubscription.getSubscriber().getId())
                .subscribed(true)
                .status(savedSubscription.getStatus().name())
                .expiresAt(savedSubscription.getExpiresAt())
                .build();
    }

    @Transactional
    public String handleRazorpayCallback(
            Long creatorId,
            Long subscriberId,
            String paymentReference,
            Long questionId,
            String paymentGatewayOrderId,
            String externalPaymentId,
            String paymentSignature) {
        try {
            SubscriptionConfirmRequestDto request = new SubscriptionConfirmRequestDto();
            request.setCreatorId(creatorId);
            request.setSubscriberId(subscriberId);
            request.setPaymentReference(paymentReference);
            request.setPaymentGatewayOrderId(paymentGatewayOrderId);
            request.setExternalPaymentId(externalPaymentId);
            request.setPaymentSignature(paymentSignature);
            confirmCheckout(request);
            return buildQuestionRedirectUrl(questionId, "success", null);
        } catch (RuntimeException exception) {
            return buildQuestionRedirectUrl(questionId, "failed", exception.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public long countActiveSubscribers(Long creatorId) {
        return subscriptionRepository.countByCreatorIdAndStatus(creatorId, SubscriptionStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateMonthlySubscriptionIncome(User creator) {
        return calculateMonthlySubscriptionIncome(creator, countActiveSubscribers(creator.getId()));
    }

    private BigDecimal calculateMonthlySubscriptionIncome(User creator, long activeSubscriberCount) {
        return resolveSubscriptionPrice(creator)
                .multiply(BigDecimal.valueOf(activeSubscriberCount))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal resolveSubscriptionPrice(User creator) {
        if (creator.getSubscriptionPrice() != null) {
            return creator.getSubscriptionPrice();
        }
        return BigDecimal.valueOf(9.99);
    }

    public String resolveSubscriptionCurrency(User creator) {
        String currency;
        if (creator.getSubscriptionCurrency() != null && !creator.getSubscriptionCurrency().isBlank()) {
            currency = creator.getSubscriptionCurrency().toUpperCase(Locale.ROOT);
        } else {
            currency = defaultCurrency.toUpperCase(Locale.ROOT);
        }
        return normalizeCheckoutCurrency(resolveGateway(null), currency);
    }

    private String normalizeCheckoutCurrency(PaymentGateway gateway, String currency) {
        if (gateway == PaymentGateway.RAZORPAY && !"INR".equalsIgnoreCase(currency)) {
            return "INR";
        }
        return currency.toUpperCase(Locale.ROOT);
    }

    private String buildQuestionRedirectUrl(Long questionId, String status, String message) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(frontendBaseUrl)
                .path("/question/{questionId}")
                .queryParam("subscription", status);

        if (message != null && !message.isBlank()) {
            builder.queryParam("subscriptionMessage", message);
        }

        return builder.buildAndExpand(questionId).toUriString();
    }

    private PaymentGateway resolveGateway(String gateway) {
        if (gateway == null || gateway.isBlank()) {
            return PaymentGateway.valueOf(defaultPaymentGateway.trim().toUpperCase(Locale.ROOT));
        }
        try {
            return PaymentGateway.valueOf(gateway.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return PaymentGateway.valueOf(defaultPaymentGateway.trim().toUpperCase(Locale.ROOT));
        }
    }

    private String createRazorpayOrder(BigDecimal amount, String currency, String receipt) {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured");
        }
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();

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
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Unable to create Razorpay order", ex);
        }
    }

    private void verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured");
        }
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] generatedBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexBuilder = new StringBuilder();
            for (byte b : generatedBytes) {
                hexBuilder.append(String.format("%02x", b));
            }
            String expectedSignature = hexBuilder.toString();
            if (!expectedSignature.equals(signature)) {
                throw new IllegalArgumentException("Invalid Razorpay payment signature");
            }
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Unable to verify Razorpay signature", ex);
        }
    }
}

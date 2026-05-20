package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.CreatorSubscriptionSettingsDto;
import com.example.Quora.dtos.SubscriptionCheckoutRequestDto;
import com.example.Quora.dtos.SubscriptionCheckoutResponseDto;
import com.example.Quora.dtos.SubscriptionConfirmRequestDto;
import com.example.Quora.dtos.SubscriptionStatusDto;
import com.example.Quora.services.SubscriptionService;
import java.net.URI;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/creator")
    public ResponseEntity<ApiResponse<CreatorSubscriptionSettingsDto>> getCreatorSettings(
            @RequestParam("creatorId") Long creatorId,
            @RequestParam(name = "viewerUserId", required = false) Long viewerUserId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Creator subscription settings retrieved successfully",
                        subscriptionService.getCreatorSettings(creatorId, viewerUserId)));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SubscriptionStatusDto>> getSubscriptionStatus(
            @RequestParam("creatorId") Long creatorId,
            @RequestParam("subscriberId") Long subscriberId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Subscription status retrieved successfully",
                        subscriptionService.getSubscriptionStatus(creatorId, subscriberId)));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<SubscriptionCheckoutResponseDto>> createCheckout(
            @RequestBody SubscriptionCheckoutRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Subscription checkout created successfully",
                        subscriptionService.createCheckout(request)));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<SubscriptionStatusDto>> confirmCheckout(
            @RequestBody SubscriptionConfirmRequestDto request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Subscription activated successfully",
                        subscriptionService.confirmCheckout(request)));
    }

    @PostMapping("/razorpay/callback")
    public ResponseEntity<Void> handleRazorpayCallback(
            @RequestParam("creatorId") Long creatorId,
            @RequestParam("subscriberId") Long subscriberId,
            @RequestParam("paymentReference") String paymentReference,
            @RequestParam("questionId") Long questionId,
            @RequestParam("razorpay_order_id") String razorpayOrderId,
            @RequestParam("razorpay_payment_id") String razorpayPaymentId,
            @RequestParam("razorpay_signature") String razorpaySignature) {
        String redirectUrl = subscriptionService.handleRazorpayCallback(
                creatorId,
                subscriberId,
                paymentReference,
                questionId,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}

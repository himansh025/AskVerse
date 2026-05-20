package com.example.Quora.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class GlobalCorsConfig {

    @Value("${app.cors.local-origins}")
    private String localOrigins;

    @Value("${app.cors.production-origins}")
    private String prodOrigins;

    @Value("${app.cors.payment-origins:}")
    private String paymentOrigins;

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> allowedOriginPatterns = new ArrayList<>();
        allowedOriginPatterns.addAll(Arrays.asList(localOrigins.split(",")));
        allowedOriginPatterns.addAll(Arrays.asList(prodOrigins.split(",")));
        if (paymentOrigins != null && !paymentOrigins.isBlank()) {
            allowedOriginPatterns.addAll(Arrays.asList(paymentOrigins.split(",")));
        }

        config.setAllowedOriginPatterns(allowedOriginPatterns);
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type"
        ));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        System.out.println("🔍 CORS ALLOWED ORIGIN PATTERNS => " + allowedOriginPatterns);

        return source;
    }
}

package com.example.Quora.configurations;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class GlobalCorsConfig {

    @Value("${app.cors.local-origins}")
    private String localOrigins;

    @Value("${app.cors.production-origins}")
    private String prodOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> allowedOrigins = new ArrayList<>();
        allowedOrigins.addAll(Arrays.asList(localOrigins.split(",")));
        allowedOrigins.addAll(Arrays.asList(prodOrigins.split(",")));

        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        // 🔍 debug once
        System.out.println("CORS ALLOWED ORIGINS => " + allowedOrigins);

        return new CorsFilter(source);
    }
}


package com.example.Quora.filters;

import com.example.Quora.services.UserDetailsServiceImp;
import com.example.Quora.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImp userDetailsServiceImp;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsServiceImp userDetailsServiceImp) {
        this.jwtUtil = jwtUtil;
        this.userDetailsServiceImp = userDetailsServiceImp;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // CRITICAL: Handle OPTIONS requests first (preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        
        // Public endpoints that don't need JWT validation
        if (path.startsWith("/api/v1/users/signup") ||
                path.startsWith("/api/v1/users/signin") ||
                path.startsWith("/api/health") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars") ||
                path.equals("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Allow GET requests to these endpoints without auth
        if ("GET".equalsIgnoreCase(request.getMethod()) &&
                (path.startsWith("/api/v1/questions") ||
                 path.startsWith("/api/v1/tags") ||
                 path.startsWith("/api/v1/answers") ||
                 path.startsWith("/api/v1/comments"))) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract and validate JWT token
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email;

        try {
            email = jwtUtil.extractEmail(token);
        } catch (Exception e) {
            System.err.println("JWT extraction error: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (email != null && auth == null) {
            try {
                UserDetails userDetails = userDetailsServiceImp.loadUserByUsername(email);

                if (jwtUtil.validateToken(token, email)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                System.err.println("Authentication error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
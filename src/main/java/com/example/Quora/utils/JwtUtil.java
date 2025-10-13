package com.example.Quora.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
//    @Value("${jwt.secret}")
    private String Secret="fgvrewsff#@$354trVFGrfvffrbgvdgedfsfbgrfbfdhrdvf";

    private SecretKey getSignInkey() {
        return Keys.hmacShaKeyFor(Secret.getBytes(StandardCharsets.UTF_8));
    }

    private static final long expirationTime = 1000 * 60 * 60;

    public String createToken(Map<String, Object> payload, String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignInkey())
                .compact();
    }

    // create token with username
    public String createToken(String email) {
        // calling the method with  payload
        return createToken(new HashMap<>(), email);
    }

    public Claims extractAllPayloads(String token) {
        return Jwts.parser()
                .verifyWith(getSignInkey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // take token and a function to extract something like expDate,Email
    public <T> T extractClaims(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllPayloads(token);
        return claimResolver.apply(claims);
    }

    public Date extractExpiration(String token) {
        return extractClaims(token, Claims::getExpiration);
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    public String extractEmail(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    public Boolean validateToken(String token, String email) {
        final String userEmailfetchFromToken = extractEmail(token);
        return (userEmailfetchFromToken.equals(email)) && !isTokenExpired(token);
    }

    //    for extracting the desired payload with key
    public Object extractPayload(String token, String payloadKey) {
        Claims claim = extractAllPayloads(token);
        return (Object) claim.get(payloadKey);
    }
}

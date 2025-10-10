package com.example.Quora.filters;

import com.example.Quora.services.UserDetailsServiceImp;
import com.example.Quora.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
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
public class JwtFilter extends OncePerRequestFilter{

    private JwtUtil jwtUtil;
    private UserDetailsServiceImp userDetailsServiceImp;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsServiceImp userDetailsServiceImp) {
        this.jwtUtil=jwtUtil;
        this.userDetailsServiceImp=userDetailsServiceImp;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        String authHeader= request.getHeader("Authorization");
        String path = request.getRequestURI();
        if (path.startsWith("/user/signup") || path.startsWith("/user/signin")||path.startsWith("/api/health") ) {
            filterChain.doFilter(request, response);
            return; // skip JWT validation for signup/ signIn
        }
        String token = null;
        String email= null;
        if(request.getCookies()!=null){
            for (Cookie cookie : request.getCookies()){
                if(cookie.getName().equals("JwtToken")){
                    token=cookie.getValue();
                }
            }
        }
        if (token == null){
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
        }
            email = jwtUtil.extractEmail(token);

        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        if(email !=null && auth==null){
            UserDetails userDetails= userDetailsServiceImp.loadUserByUsername(email);
            if(jwtUtil.validateToken(token,email)){
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken= new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }

        }
        filterChain.doFilter(request,response);
    }
}

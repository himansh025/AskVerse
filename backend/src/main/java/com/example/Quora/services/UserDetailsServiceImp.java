package com.example.Quora.services;

import com.example.Quora.models.User;
import com.example.Quora.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.List;

@Service
public class UserDetailsServiceImp implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> user = this.userRepository.findUserByEmail(email);
        System.out.println("users is "+user);
        if (user.isPresent()) {
            List<org.springframework.security.core.GrantedAuthority> authorities = java.util.Collections.singletonList(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.get().getRole().toUpperCase())
            );
            return new org.springframework.security.core.userdetails.User(
                    user.get().getEmail(),
                    user.get().getPassword(),
                    authorities);
        } else {
            throw new UsernameNotFoundException("Cannot find the Passenger by the given Email");
        }
    }
}

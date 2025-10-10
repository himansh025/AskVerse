package com.example.Quora.services;

import com.example.Quora.helpers.AuthUserDetails;
import com.example.Quora.models.User;
import com.example.Quora.repository.UserRepository;
import com.example.Uber_Entity.models.Passenger;
import com.uber.authService.helpers.AuthPassengerDetails;
import com.uber.authService.repositories.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class
UserDetailsServiceImp implements UserDetailsService {


    @Autowired
    private UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> user = this.userRepository.findByEmail(email);
        if (user.isPresent()) {
            return new AuthUserDetails(user.get());
        } else {
            throw new UsernameNotFoundException("Cannot find the Passenger by the given Email");
        }
    }
}

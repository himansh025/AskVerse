package com.example.Quora.helpers;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

//spring security works on  user details polymorphic type for auth so make passenger into it
public class AuthUserDetails extends User implements UserDetails {
    private String username;
    private String password;
//    private  String role;


    public AuthUserDetails(User user) {
        this.username = user.getUsername();
        this.password = user.getPassword();

    }



    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        return null;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

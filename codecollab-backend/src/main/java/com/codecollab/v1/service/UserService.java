package com.codecollab.v1.service;

import com.codecollab.v1.dto.AuthRequest;
import com.codecollab.v1.dto.AuthResponse;
import com.codecollab.v1.entity.User;
import com.codecollab.v1.repository.UserRepository;
import com.codecollab.v1.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthResponse register(AuthRequest request) {
        // Check if user already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, null, "Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, "Email already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername());
        
        // Don't return password hash
        savedUser.setPasswordHash(null);
        
        return new AuthResponse(token, savedUser, "User registered successfully");
    }
    
    public AuthResponse login(AuthRequest request) {
        // Find user by username or email
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (!userOptional.isPresent()) {
            userOptional = userRepository.findByEmail(request.getUsername()); // Allow login with email
        }
        
        if (!userOptional.isPresent()) {
            return new AuthResponse(null, null, "Invalid credentials");
        }
        
        User user = userOptional.get();
        
        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(null, null, "Invalid credentials");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        
        // Don't return password hash
        user.setPasswordHash(null);
        
        return new AuthResponse(token, user, "Login successful");
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User createOrUpdateGoogleUser(String email, String name) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        // Create new user from Google OAuth
        User user = new User();
        user.setEmail(email);
        user.setUsername(generateUsernameFromEmail(email));
        user.setPasswordHash("OAUTH_USER"); // Special marker for OAuth users
        
        return userRepository.save(user);
    }
    
    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}

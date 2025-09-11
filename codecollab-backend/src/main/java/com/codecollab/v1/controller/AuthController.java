package com.codecollab.v1.controller;

import com.codecollab.v1.dto.AuthRequest;
import com.codecollab.v1.dto.AuthResponse;
import com.codecollab.v1.entity.User;
import com.codecollab.v1.service.UserService;
import com.codecollab.v1.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = userService.register(request);
            
            if (response.getToken() != null) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new AuthResponse(null, null, "Registration failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = userService.login(request);
            
            if (response.getToken() != null) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new AuthResponse(null, null, "Login failed: " + e.getMessage()));
        }
    }
    
    // This is the corrected OAuth2 success handler
    @GetMapping("/google/success")
    public void handleGoogleSuccess(@AuthenticationPrincipal OAuth2User oauth2User, 
                                   HttpServletResponse response,
                                   HttpServletRequest request) throws IOException {
        try {
            System.out.println("OAuth2 success handler called");
            
            // Check if OAuth2User is present
            if (oauth2User == null) {
                System.err.println("OAuth2User is null - authentication context lost");
                response.sendRedirect("http://localhost:3000/auth/error?message=Authentication context lost");
                return;
            }
            
            // Extract user info from OAuth2User
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String givenName = oauth2User.getAttribute("given_name");
            
            System.out.println("OAuth2 User - Email: " + email + ", Name: " + name);
            
            if (email == null) {
                System.err.println("Email not provided by Google");
                response.sendRedirect("http://localhost:3000/auth/error?message=Email not provided by Google");
                return;
            }
            
            // Create or update user in database
            User user = userService.createOrUpdateGoogleUser(email, name != null ? name : givenName);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());
            
            System.out.println("Generated token for user: " + user.getUsername());
            
            // Redirect to frontend with token
            String redirectUrl = String.format("http://localhost:3000/auth/success?token=%s&user=%s", 
                                              token, user.getUsername());
            
            System.out.println("Redirecting to: " + redirectUrl);
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            System.err.println("OAuth2 success handling error: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("http://localhost:3000/auth/error?message=Authentication processing failed");
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            
            if (jwtUtil.validateToken(jwt)) {
                String username = jwtUtil.getUsernameFromToken(jwt);
                return userService.findByUsername(username)
                    .map(user -> {
                        user.setPasswordHash(null); // Don't return password
                        return ResponseEntity.ok(user);
                    })
                    .orElse(ResponseEntity.notFound().build());
            } else {
                return ResponseEntity.status(401).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
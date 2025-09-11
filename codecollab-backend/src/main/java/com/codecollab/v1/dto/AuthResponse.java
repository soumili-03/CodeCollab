package com.codecollab.v1.dto;

import com.codecollab.v1.entity.User;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private User user;
    private String message;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, User user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

// RoomCodeSubmissionRequest.java  
package com.codecollab.v1.dto;

public class RoomCodeSubmissionRequest {
    private String roomCode;
    private String code;
    private String language;
    
    // Constructors
    public RoomCodeSubmissionRequest() {}
    
    public RoomCodeSubmissionRequest(String roomCode, String code, String language) {
        this.roomCode = roomCode;
        this.code = code;
        this.language = language;
    }
    
    // Getters and Setters
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
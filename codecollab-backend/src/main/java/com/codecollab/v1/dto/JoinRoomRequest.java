// JoinRoomRequest.java
package com.codecollab.v1.dto;

public class JoinRoomRequest {
    private String roomCode;
    
    // Constructors
    public JoinRoomRequest() {}
    
    public JoinRoomRequest(String roomCode) {
        this.roomCode = roomCode;
    }
    
    // Getters and Setters
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
}
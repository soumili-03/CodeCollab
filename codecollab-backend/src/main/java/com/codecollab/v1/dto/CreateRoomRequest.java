
// CreateRoomRequest.java
package com.codecollab.v1.dto;

import com.codecollab.v1.entity.Room;

public class CreateRoomRequest {
    private String roomName;
    private Room.RoomMode mode;
    private Integer timeLimit; // in minutes
    
    // Constructors
    public CreateRoomRequest() {}
    
    public CreateRoomRequest(String roomName, Room.RoomMode mode, Integer timeLimit) {
        this.roomName = roomName;
        this.mode = mode;
        this.timeLimit = timeLimit;
    }
    
    // Getters and Setters
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    
    public Room.RoomMode getMode() { return mode; }
    public void setMode(Room.RoomMode mode) { this.mode = mode; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
}
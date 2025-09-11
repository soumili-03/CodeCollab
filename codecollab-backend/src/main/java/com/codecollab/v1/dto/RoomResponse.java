// RoomResponse.java
package com.codecollab.v1.dto;

import com.codecollab.v1.entity.Room;
import java.time.LocalDateTime;
import java.util.List;

public class RoomResponse {
    private Long id;
    private String roomCode;
    private String roomName;
    private String hostUsername;
    private Room.RoomMode mode;
    private Room.RoomStatus status;
    private Integer maxMembers;
    private Integer currentMembers;
    private LocalDateTime createdAt;
    private List<RoomMemberInfo> members;
    private String currentProblemTitle;
    private Integer timeLimit;
    private LocalDateTime startTime;
    
    // Constructors
    public RoomResponse() {}
    
    // Factory method
    public static RoomResponse fromRoom(Room room, List<RoomMemberInfo> members) {
        RoomResponse response = new RoomResponse();
        response.setId(room.getId());
        response.setRoomCode(room.getRoomCode());
        response.setRoomName(room.getRoomName());
        response.setHostUsername(room.getHost().getUsername());
        response.setMode(room.getMode());
        response.setStatus(room.getStatus());
        response.setMaxMembers(room.getMaxMembers());
        response.setCurrentMembers(room.getCurrentMembers());
        response.setCreatedAt(room.getCreatedAt());
        response.setMembers(members);
        response.setCurrentProblemTitle(room.getCurrentProblem() != null ? room.getCurrentProblem().getTitle() : null);
        response.setTimeLimit(room.getTimeLimit());
        response.setStartTime(room.getStartTime());
        return response;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    
    public String getHostUsername() { return hostUsername; }
    public void setHostUsername(String hostUsername) { this.hostUsername = hostUsername; }
    
    public Room.RoomMode getMode() { return mode; }
    public void setMode(Room.RoomMode mode) { this.mode = mode; }
    
    public Room.RoomStatus getStatus() { return status; }
    public void setStatus(Room.RoomStatus status) { this.status = status; }
    
    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    
    public Integer getCurrentMembers() { return currentMembers; }
    public void setCurrentMembers(Integer currentMembers) { this.currentMembers = currentMembers; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<RoomMemberInfo> getMembers() { return members; }
    public void setMembers(List<RoomMemberInfo> members) { this.members = members; }
    
    public String getCurrentProblemTitle() { return currentProblemTitle; }
    public void setCurrentProblemTitle(String currentProblemTitle) { this.currentProblemTitle = currentProblemTitle; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
}
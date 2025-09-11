// RoomSessionResponse.java - Updated factory method
package com.codecollab.v1.dto;

import com.codecollab.v1.entity.Problem;
import com.codecollab.v1.entity.Room;
import java.time.LocalDateTime;
import java.util.List;

public class RoomSessionResponse {
    private Long roomId;
    private String roomCode;
    private String roomName;
    private String hostUsername;
    private Room.RoomMode mode;
    private Room.RoomStatus status;
    private Problem problem;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer timeLimit;
    private Integer remainingTimeMinutes;
    private List<RoomMemberInfo> members;
    
    // Constructors
    public RoomSessionResponse() {}
    
    // Factory method - UPDATED
    public static RoomSessionResponse fromRoom(Room room, List<RoomMemberInfo> members) {
        RoomSessionResponse response = new RoomSessionResponse();
        response.setRoomId(room.getId());
        response.setRoomCode(room.getRoomCode());
        response.setRoomName(room.getRoomName());
        response.setHostUsername(room.getHost().getUsername());
        response.setMode(room.getMode());
        response.setStatus(room.getStatus());
        
        // IMPORTANT: Ensure problem is loaded properly
        if (room.getCurrentProblem() != null) {
            Problem fullProblem = new Problem();
            fullProblem.setId(room.getCurrentProblem().getId());
            fullProblem.setTitle(room.getCurrentProblem().getTitle());
            fullProblem.setDifficulty(room.getCurrentProblem().getDifficulty());
            fullProblem.setCategory(room.getCurrentProblem().getCategory());
            fullProblem.setDescription(room.getCurrentProblem().getDescription());
            fullProblem.setInputFormat(room.getCurrentProblem().getInputFormat());
            fullProblem.setOutputFormat(room.getCurrentProblem().getOutputFormat());
            fullProblem.setConstraints(room.getCurrentProblem().getConstraints());
            fullProblem.setTimeLimitMs(room.getCurrentProblem().getTimeLimitMs());
            fullProblem.setMemoryLimitMb(room.getCurrentProblem().getMemoryLimitMb());
            fullProblem.setSampleInput(room.getCurrentProblem().getSampleInput());
            fullProblem.setSampleOutput(room.getCurrentProblem().getSampleOutput());
            fullProblem.setExplanation(room.getCurrentProblem().getExplanation());
            response.setProblem(fullProblem);
        }
        
        response.setStartTime(room.getStartTime());
        response.setEndTime(room.getEndTime());
        response.setTimeLimit(room.getTimeLimit());
        response.setMembers(members);
        
        // Calculate remaining time
        if (room.getStartTime() != null && room.getTimeLimit() != null && room.getTimeLimit() > 0) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime sessionEnd = room.getStartTime().plusMinutes(room.getTimeLimit());
            if (now.isBefore(sessionEnd)) {
                long remainingMinutes = java.time.Duration.between(now, sessionEnd).toMinutes();
                response.setRemainingTimeMinutes((int) Math.max(0, remainingMinutes));
            } else {
                response.setRemainingTimeMinutes(0);
            }
        }
        
        return response;
    }
    
    // Add this getter for hostUsername
    public String getHostUsername() { return hostUsername; }
    public void setHostUsername(String hostUsername) { this.hostUsername = hostUsername; }
    
    // Existing Getters and Setters
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    
    public Room.RoomMode getMode() { return mode; }
    public void setMode(Room.RoomMode mode) { this.mode = mode; }
    
    public Room.RoomStatus getStatus() { return status; }
    public void setStatus(Room.RoomStatus status) { this.status = status; }
    
    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
    
    public Integer getRemainingTimeMinutes() { return remainingTimeMinutes; }
    public void setRemainingTimeMinutes(Integer remainingTimeMinutes) { 
        this.remainingTimeMinutes = remainingTimeMinutes; 
    }
    
    public List<RoomMemberInfo> getMembers() { return members; }
    public void setMembers(List<RoomMemberInfo> members) { this.members = members; }
}
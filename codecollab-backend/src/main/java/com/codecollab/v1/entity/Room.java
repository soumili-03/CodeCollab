// Room.java - Update the currentProblem field
package com.codecollab.v1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 8)
    private String roomCode;

    @Column(nullable = false, length = 100)
    private String roomName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.WAITING;

    @Column(nullable = false)
    private Integer maxMembers = 4;

    @Column(nullable = false)
    private Integer currentMembers = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_problem_id")
    private Problem currentProblem;

    @Column
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer timeLimit = 0;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RoomMember> members = new ArrayList<>();

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    // Enums
    public enum RoomMode {
        PRACTICE, TOURNAMENT
    }

    public enum RoomStatus {
        WAITING, ACTIVE, DISCUSSION, PAUSED, COMPLETED, ENDED, ARCHIVED
    }
    

    // ✅ Required by JPA
    public Room() {
        this.status = RoomStatus.WAITING;
        this.createdAt = LocalDateTime.now();
        this.currentMembers = 0; // since no host is assigned yet
    }

    // ✅ Custom constructor for service layer
    public Room(String roomCode, String roomName, User host, RoomMode mode) {
        this.roomCode = roomCode;
        this.roomName = roomName;
        this.host = host;
        this.mode = mode;
        this.status = RoomStatus.WAITING;
        this.createdAt = LocalDateTime.now();
        this.currentMembers = 1; // host is counted as member
    }

    // Utility methods
    public boolean isFull() { return currentMembers >= maxMembers; }

    public boolean canJoin() { return status == RoomStatus.WAITING && !isFull(); }

    public void incrementMembers() { this.currentMembers++; }

    public void decrementMembers() {
        if (this.currentMembers > 0) this.currentMembers--;
    }
    
    // All getters and setters remain the same
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    
    public User getHost() { return host; }
    public void setHost(User host) { this.host = host; }
    
    public RoomMode getMode() { return mode; }
    public void setMode(RoomMode mode) { this.mode = mode; }
    
    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }
    
    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    
    public Integer getCurrentMembers() { return currentMembers; }
    public void setCurrentMembers(Integer currentMembers) { this.currentMembers = currentMembers; }
    
    public Problem getCurrentProblem() { return currentProblem; }
    public void setCurrentProblem(Problem currentProblem) { this.currentProblem = currentProblem; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<RoomMember> getMembers() { return members; }
    public void setMembers(List<RoomMember> members) { this.members = members; }
    
}
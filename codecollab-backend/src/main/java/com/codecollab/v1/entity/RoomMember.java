package com.codecollab.v1.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_members", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"}))
public class RoomMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore // Prevent circular reference
    private Room room;
    
    @ManyToOne(fetch = FetchType.EAGER) // Changed to EAGER for better loading
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role; // HOST, MEMBER
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status; // JOINED, LEFT, DISCONNECTED
    
    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime joinedAt;
    
    @Column
    private LocalDateTime leftAt;
    
    // Submission tracking
    @Column
    private LocalDateTime submissionTime;
    
    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer score = 0;
    
    @Column(name = "member_rank", columnDefinition = "INTEGER DEFAULT 0") // Renamed to avoid reserved keyword
    private Integer rank = 0;
    
    // Enums
    public enum MemberRole {
        HOST, MEMBER
    }
    
    public enum MemberStatus {
        JOINED, LEFT, DISCONNECTED
    }
    
    // Constructors
    public RoomMember() {
        this.joinedAt = LocalDateTime.now();
        this.status = MemberStatus.JOINED;
    }
    
    public RoomMember(Room room, User user, MemberRole role) {
        this();
        this.room = room;
        this.user = user;
        this.role = role;
    }
    
    // Utility methods
    public boolean isHost() {
        return role == MemberRole.HOST;
    }
    
    public boolean isActive() {
        return status == MemberStatus.JOINED;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public MemberRole getRole() { return role; }
    public void setRole(MemberRole role) { this.role = role; }
    
    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    
    public LocalDateTime getLeftAt() { return leftAt; }
    public void setLeftAt(LocalDateTime leftAt) { this.leftAt = leftAt; }
    
    public LocalDateTime getSubmissionTime() { return submissionTime; }
    public void setSubmissionTime(LocalDateTime submissionTime) { this.submissionTime = submissionTime; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
}
// RoomMemberInfo.java
package com.codecollab.v1.dto;

import com.codecollab.v1.entity.RoomMember;
import java.time.LocalDateTime;

public class RoomMemberInfo {
    private String username;
    private String email;
    private Integer rating;
    private RoomMember.MemberRole role;
    private RoomMember.MemberStatus status;
    private LocalDateTime joinedAt;
    private Integer score;
    private Integer rank;
    
    // Constructors
    public RoomMemberInfo() {}
    
    // Factory method
    public static RoomMemberInfo fromRoomMember(RoomMember member) {
        RoomMemberInfo info = new RoomMemberInfo();
        info.setUsername(member.getUser().getUsername());
        info.setEmail(member.getUser().getEmail());
        info.setRating(member.getUser().getRating());
        info.setRole(member.getRole());
        info.setStatus(member.getStatus());
        info.setJoinedAt(member.getJoinedAt());
        info.setScore(member.getScore());
        info.setRank(member.getRank());
        return info;
    }
    
    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public RoomMember.MemberRole getRole() { return role; }
    public void setRole(RoomMember.MemberRole role) { this.role = role; }
    
    public RoomMember.MemberStatus getStatus() { return status; }
    public void setStatus(RoomMember.MemberStatus status) { this.status = status; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
}
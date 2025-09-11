package com.codecollab.v1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rounds")
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // many rounds per room
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // linked problem (nullable if you want)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id")
    private Problem problem;

    private Integer roundNumber;

    private String mode; // "PRACTICE" or "BATTLE"

    private Integer timeLimitSeconds; // nullable for practice

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    // getters / setters
    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }
    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public Integer getTimeLimitSeconds() { return timeLimitSeconds; }
    public void setTimeLimitSeconds(Integer timeLimitSeconds) { this.timeLimitSeconds = timeLimitSeconds; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}

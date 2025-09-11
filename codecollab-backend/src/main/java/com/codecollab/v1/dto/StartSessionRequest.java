
// StartSessionRequest.java
package com.codecollab.v1.dto;

public class StartSessionRequest {
    private Long problemId;
    private Integer timeLimit; // in minutes, optional
    
    // Constructors
    public StartSessionRequest() {}
    
    public StartSessionRequest(Long problemId, Integer timeLimit) {
        this.problemId = problemId;
        this.timeLimit = timeLimit;
    }
    
    // Getters and Setters
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
}
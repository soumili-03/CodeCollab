package com.codecollab.v1.dto;

public class CodeSubmissionRequest {
    private Long problemId;
    private String code;
    private String language;
    
    // Constructors
    public CodeSubmissionRequest() {}
    
    public CodeSubmissionRequest(Long problemId, String code, String language) {
        this.problemId = problemId;
        this.code = code;
        this.language = language;
    }
    
    // Getters and Setters
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
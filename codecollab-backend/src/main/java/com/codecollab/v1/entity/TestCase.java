package com.codecollab.v1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_cases")
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String inputData;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;
    
    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isSample = false;
    
    @Column(columnDefinition = "INTEGER DEFAULT 10")
    private Integer points = 10;
    
    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    // Constructors
    public TestCase() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }
    
    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }
    
    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    
    public Boolean getIsSample() { return isSample; }
    public void setIsSample(Boolean isSample) { this.isSample = isSample; }
    
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
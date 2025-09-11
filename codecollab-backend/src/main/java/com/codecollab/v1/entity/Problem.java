package com.codecollab.v1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "problems")
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;
    
    @Column(nullable = false, length = 50)
    private String category;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String inputFormat;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String outputFormat;
    
    @Column(columnDefinition = "TEXT")
    private String constraints;
    
    @Column(columnDefinition = "INTEGER DEFAULT 2000")
    private Integer timeLimitMs = 2000;
    
    @Column(columnDefinition = "INTEGER DEFAULT 256")
    private Integer memoryLimitMb = 256;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String sampleInput;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String sampleOutput;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Add this annotation
    private List<TestCase> testCases;
    
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
    
    // Constructors
    public Problem() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters (generate using Eclipse: Right-click → Source → Generate Getters and Setters)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }
    
    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }
    
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    
    public Integer getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }
    
    public Integer getMemoryLimitMb() { return memoryLimitMb; }
    public void setMemoryLimitMb(Integer memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }
    
    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }
    
    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }
    
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
}
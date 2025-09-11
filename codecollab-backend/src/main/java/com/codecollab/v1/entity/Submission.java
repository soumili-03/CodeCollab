package com.codecollab.v1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String code;

    private String language;

    private String resultStatus; // AC / WA / ERROR / PENDING

    private Integer passedCount;

    private Integer totalCount;

    private Long executionTimeMs;

    private Boolean autoSubmitted = false;

    private LocalDateTime submittedAt;

    // getters / setters
    public Long getId() { return id; }
    public Round getRound() { return round; }
    public void setRound(Round round) { this.round = round; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getResultStatus() { return resultStatus; }
    public void setResultStatus(String resultStatus) { this.resultStatus = resultStatus; }
    public Integer getPassedCount() { return passedCount; }
    public void setPassedCount(Integer passedCount) { this.passedCount = passedCount; }
    public Integer getTotalCount() { return totalCount; }
    public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }
    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    public Boolean getAutoSubmitted() { return autoSubmitted; }
    public void setAutoSubmitted(Boolean autoSubmitted) { this.autoSubmitted = autoSubmitted; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}

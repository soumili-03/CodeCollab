package com.codecollab.v1.dto;

import java.util.List;

public class ExecutionResult {
    private String status; // "AC", "WA", "TLE", "CE", "RE"
    private String message;
    private int totalTestCases;
    private int passedTestCases;
    private int executionTimeMs;
    private int memoryUsedMB;
    private List<TestCaseResult> testCaseResults;
    
    // Constructors
    public ExecutionResult() {}
    
    public ExecutionResult(String status, String message) {
        this.status = status;
        this.message = message;
    }
    
    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public int getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(int totalTestCases) { this.totalTestCases = totalTestCases; }
    
    public int getPassedTestCases() { return passedTestCases; }
    public void setPassedTestCases(int passedTestCases) { this.passedTestCases = passedTestCases; }
    
    public int getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(int executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    
    public int getMemoryUsedMB() { return memoryUsedMB; }
    public void setMemoryUsedMB(int memoryUsedMB) { this.memoryUsedMB = memoryUsedMB; }
    
    public List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
    public void setTestCaseResults(List<TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
    
    public static class TestCaseResult {
        private boolean passed;
        private String expected;
        private String actual;
        private String error;
        private int executionTimeMs;
        
        // Constructors
        public TestCaseResult() {}
        
        public TestCaseResult(boolean passed, String expected, String actual) {
            this.passed = passed;
            this.expected = expected;
            this.actual = actual;
        }
        
        // Getters and Setters
        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }
        
        public String getExpected() { return expected; }
        public void setExpected(String expected) { this.expected = expected; }
        
        public String getActual() { return actual; }
        public void setActual(String actual) { this.actual = actual; }
        
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        
        public int getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(int executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    }
}
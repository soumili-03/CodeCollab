package com.codecollab.v1.service;

import com.codecollab.v1.dto.ExecutionResult;
import com.codecollab.v1.entity.TestCase;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {
    
    private final WebClient webClient = WebClient.builder()
        .baseUrl("http://localhost:2358")
        .codecs(configurer -> configurer
            .defaultCodecs()
            .maxInMemorySize(10 * 1024 * 1024))
        .build();
    
    private final Map<String, Integer> languageIds = Map.of(
        "cpp", 54,
        "java", 62,
        "python", 71,
        "javascript", 63
    );
    
    public ExecutionResult executeCode(String code, String language, List<TestCase> testCases) {
        ExecutionResult result = new ExecutionResult();
        List<ExecutionResult.TestCaseResult> testCaseResults = new ArrayList<>();
        
        int passed = 0;
        int total = testCases.size();
        
        System.out.println("=== EXECUTING CODE ===");
        System.out.println("Language: " + language);
        System.out.println("Test cases: " + total);
        
        try {
            if (!testJudge0Connection()) {
                result.setStatus("ERROR");
                result.setMessage("Judge0 service is not available. Please try again in a few seconds.");
                return result;
            }
            
            for (int i = 0; i < testCases.size(); i++) {
                TestCase testCase = testCases.get(i);
                System.out.println("Running test case " + (i + 1));
                
                ExecutionResult.TestCaseResult tcResult = executeTestCaseAsync(code, language, testCase);
                testCaseResults.add(tcResult);
                
                if (tcResult.isPassed()) {
                    passed++;
                    System.out.println("✅ PASSED");
                } else {
                    System.out.println("❌ FAILED: " + tcResult.getError());
                }
            }
            
            result.setTotalTestCases(total);
            result.setPassedTestCases(passed);
            result.setTestCaseResults(testCaseResults);
            
            if (passed == total) {
                result.setStatus("AC");
                result.setMessage("All test cases passed!");
            } else {
                result.setStatus("WA");
                result.setMessage("Passed " + passed + " out of " + total + " test cases");
            }
            
        } catch (Exception e) {
            System.err.println("Execution failed: " + e.getMessage());
            e.printStackTrace();
            result.setStatus("RE");
            result.setMessage("Runtime Error: " + e.getMessage());
            result.setTestCaseResults(testCaseResults);
        }
        
        System.out.println("=== EXECUTION COMPLETE: " + result.getStatus() + " ===");
        return result;
    }
    
    private boolean testJudge0Connection() {
        try {
            String response = webClient.get()
                .uri("/system_info")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(3))
                .block();
            
            boolean connected = response != null && response.contains("Architecture");
            System.out.println("Judge0 connection test: " + (connected ? "SUCCESS" : "FAILED"));
            return connected;
            
        } catch (Exception e) {
            System.err.println("Judge0 connection failed: " + e.getMessage());
            return false;
        }
    }
    
    // NEW: Async submission with polling
    private ExecutionResult.TestCaseResult executeTestCaseAsync(String code, String language, TestCase testCase) {
        ExecutionResult.TestCaseResult result = new ExecutionResult.TestCaseResult();
        
        try {
            Integer languageId = languageIds.get(language.toLowerCase());
            if (languageId == null) {
                result.setPassed(false);
                result.setError("Unsupported language: " + language);
                result.setExpected(testCase.getExpectedOutput());
                result.setActual("");
                return result;
            }
            
            // Step 1: Submit without waiting
            Map<String, Object> submission = new HashMap<>();
            submission.put("source_code", code);
            submission.put("language_id", languageId);
            submission.put("stdin", testCase.getInputData());
            
            // Add resource limits to prevent infinite loops
            submission.put("cpu_time_limit", 2.0);
            submission.put("wall_time_limit", 5.0);
            submission.put("memory_limit", 128000);
            submission.put("stack_limit", 64000);
            
            System.out.println("Submitting to Judge0 (async)...");
            
            // Submit and get token
            SubmissionResponse submissionResponse = webClient.post()
                .uri("/submissions?base64_encoded=false&wait=false") // wait=false for async
                .header("Content-Type", "application/json")
                .bodyValue(submission)
                .retrieve()
                .bodyToMono(SubmissionResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
                
            if (submissionResponse == null || submissionResponse.token == null) {
                result.setPassed(false);
                result.setError("Failed to submit to Judge0");
                result.setExpected(testCase.getExpectedOutput());
                result.setActual("");
                return result;
            }
            
            System.out.println("Submission token: " + submissionResponse.token);
            
            // Step 2: Poll for result
            Judge0Result judge0Result = pollForResult(submissionResponse.token);
            
            if (judge0Result == null) {
                result.setPassed(false);
                result.setError("Execution timeout - code took too long to run");
                result.setExpected(testCase.getExpectedOutput());
                result.setActual("");
                return result;
            }
            
            System.out.println("Judge0 Status: " + judge0Result.status.description);
            
            // Process result
            String expectedOutput = testCase.getExpectedOutput().trim();
            String actualOutput = "";
            
            if (judge0Result.status.id == 3) { // Accepted
                actualOutput = judge0Result.stdout != null ? judge0Result.stdout.trim() : "";
                result.setPassed(actualOutput.equals(expectedOutput));
                if (!result.isPassed()) {
                    result.setError("Wrong Answer");
                }
            } else {
                result.setPassed(false);
                if (judge0Result.status.id == 6) { // Compilation Error
                    result.setError("Compilation Error: " + (judge0Result.compileOutput != null ? judge0Result.compileOutput : "Unknown error"));
                } else if (judge0Result.status.id == 5 || judge0Result.status.id == 13) { // Time Limit Exceeded
                    result.setError("Time Limit Exceeded");
                } else if (judge0Result.status.id == 4) { // Wrong Answer
                    actualOutput = judge0Result.stdout != null ? judge0Result.stdout.trim() : "";
                    result.setError("Wrong Answer");
                } else {
                    result.setError("Runtime Error: " + judge0Result.status.description);
                    if (judge0Result.stderr != null && !judge0Result.stderr.trim().isEmpty()) {
                        result.setError(result.getError() + " - " + judge0Result.stderr.trim());
                    }
                }
            }
            
            result.setExpected(expectedOutput);
            result.setActual(actualOutput);
            
        } catch (Exception e) {
            System.err.println("Test case execution error: " + e.getMessage());
            e.printStackTrace();
            result.setPassed(false);
            result.setError("Execution Error: " + e.getMessage());
            result.setExpected(testCase.getExpectedOutput());
            result.setActual("");
        }
        
        return result;
    }
    
    private Judge0Result pollForResult(String token) {
        int maxAttempts = 40; // 40 attempts with varying delays = ~20 seconds max
        int attempt = 0;
        
        while (attempt < maxAttempts) {
            try {
                Judge0Result result = webClient.get()
                    .uri("/submissions/" + token + "?base64_encoded=false&fields=*")
                    .retrieve()
                    .bodyToMono(Judge0Result.class)
                    .timeout(Duration.ofSeconds(3))
                    .block();
                
                if (result != null && result.status != null) {
                    // Status IDs: 1,2 = In Queue/Processing, 3+ = Done
                    if (result.status.id > 2) {
                        return result; // Execution complete
                    }
                    
                    System.out.println("Status: " + result.status.description + " (attempt " + (attempt + 1) + ")");
                }
                
                // Smart delay: faster initially, slower later
                long delay;
                if (attempt < 10) {
                    delay = 200; // 200ms for first 10 attempts (2 seconds)
                } else if (attempt < 20) {
                    delay = 300; // 300ms for next 10 attempts (3 seconds)
                } else {
                    delay = 500; // 500ms for remaining attempts
                }
                
                TimeUnit.MILLISECONDS.sleep(delay);
                attempt++;
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                System.err.println("Polling error (attempt " + attempt + "): " + e.getMessage());
                attempt++;
                
                // Brief retry delay on error
                try {
                    TimeUnit.MILLISECONDS.sleep(500);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        System.err.println("Polling timeout after " + attempt + " attempts");
        return null;
    }
    
    // Response class for submission
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubmissionResponse {
        public String token;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Judge0Result {
        public String stdout;
        public String stderr;
        public String time;
        public Judge0Status status;
        
        @JsonProperty("compile_output")
        public String compileOutput;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Judge0Status {
        public Integer id;
        public String description;
    }
}
package com.codecollab.v1.service;

import com.codecollab.v1.dto.ExecutionResult;
import com.codecollab.v1.entity.TestCase;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

@Service
public class CodeExecutionService {
    
    private final WebClient webClient;
    private final ExecutorService executorService;
    
    private final Map<String, Integer> languageIds = Map.of(
        "cpp", 54,
        "java", 62,
        "python", 71,
        "javascript", 63
    );
    
    public CodeExecutionService() {
        this.webClient = WebClient.builder()
            .baseUrl("http://localhost:2358")
            .codecs(configurer -> configurer
                .defaultCodecs()
                .maxInMemorySize(16 * 1024 * 1024))
            .build();
        
        // Thread pool for parallel execution
        this.executorService = Executors.newFixedThreadPool(8);
    }
    
    public ExecutionResult executeCode(String code, String language, List<TestCase> testCases) {
        ExecutionResult result = new ExecutionResult();
        List<ExecutionResult.TestCaseResult> testCaseResults = Collections.synchronizedList(new ArrayList<>());
        
        int total = testCases.size();
        
        System.out.println("=== EXECUTING CODE ===");
        System.out.println("Language: " + language);
        System.out.println("Test cases: " + total);
        
        try {
            // Quick health check
            if (!testJudge0Connection()) {
                result.setStatus("ERROR");
                result.setMessage("Judge0 service is temporarily unavailable. Please try again.");
                return result;
            }
            
            // Execute test cases in parallel
            List<CompletableFuture<ExecutionResult.TestCaseResult>> futures = new ArrayList<>();
            
            for (int i = 0; i < testCases.size(); i++) {
                final int index = i;
                final TestCase testCase = testCases.get(i);
                
                CompletableFuture<ExecutionResult.TestCaseResult> future = CompletableFuture.supplyAsync(() -> {
                    System.out.println("Running test case " + (index + 1));
                    return executeTestCaseWithRetry(code, language, testCase);
                }, executorService);
                
                futures.add(future);
            }
            
            // Wait for all with timeout
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .get(60, TimeUnit.SECONDS);
            
            // Collect results
            int passed = 0;
            for (CompletableFuture<ExecutionResult.TestCaseResult> future : futures) {
                ExecutionResult.TestCaseResult tcResult = future.get();
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
            result.setStatus("ERROR");
            result.setMessage("Execution Error: " + e.getMessage());
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
                .timeout(Duration.ofSeconds(2))
                .block();
            
            return response != null && response.contains("Architecture");
        } catch (Exception e) {
            System.err.println("Judge0 connection failed: " + e.getMessage());
            return false;
        }
    }
    
    private ExecutionResult.TestCaseResult executeTestCaseWithRetry(String code, String language, TestCase testCase) {
        // Try twice with 1 second delay between attempts
        for (int attempt = 0; attempt < 2; attempt++) {
            ExecutionResult.TestCaseResult result = executeTestCaseAsync(code, language, testCase);
            
            // If success or non-retryable error, return
            if (result.isPassed() || !isRetryableError(result.getError())) {
                return result;
            }
            
            // Retry after delay
            if (attempt == 0) {
                System.out.println("Retrying test case...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        return executeTestCaseAsync(code, language, testCase);
    }
    
    private boolean isRetryableError(String error) {
        if (error == null) return false;
        String lower = error.toLowerCase();
        return lower.contains("timeout") || lower.contains("connection") || lower.contains("unavailable");
    }
    
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
            
            // Prepare submission
            Map<String, Object> submission = new HashMap<>();
            submission.put("source_code", code);
            submission.put("language_id", languageId);
            submission.put("stdin", testCase.getInputData());
            submission.put("cpu_time_limit", 3.0);
            submission.put("wall_time_limit", 10.0);
            submission.put("memory_limit", 256000);
            submission.put("stack_limit", 128000);
            
            System.out.println("Submitting to Judge0...");
            
            // Submit with automatic retry on failure
            SubmissionResponse submissionResponse = webClient.post()
                .uri("/submissions?base64_encoded=false&wait=false")
                .header("Content-Type", "application/json")
                .bodyValue(submission)
                .retrieve()
                .bodyToMono(SubmissionResponse.class)
                .retryWhen(Retry.fixedDelay(2, Duration.ofMillis(500)))
                .timeout(Duration.ofSeconds(5))
                .block();
                
            if (submissionResponse == null || submissionResponse.token == null) {
                result.setPassed(false);
                result.setError("Failed to submit to Judge0");
                result.setExpected(testCase.getExpectedOutput());
                result.setActual("");
                return result;
            }
            
            System.out.println("Token: " + submissionResponse.token);
            
            // Poll for result
            Judge0Result judge0Result = pollForResult(submissionResponse.token);
            
            if (judge0Result == null) {
                result.setPassed(false);
                result.setError("Execution timeout");
                result.setExpected(testCase.getExpectedOutput());
                result.setActual("");
                return result;
            }
            
            // Process result
            processResult(judge0Result, testCase, result);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            result.setPassed(false);
            result.setError("Execution Error: " + e.getMessage());
            result.setExpected(testCase.getExpectedOutput());
            result.setActual("");
        }
        
        return result;
    }
    
    private void processResult(Judge0Result judge0Result, TestCase testCase, ExecutionResult.TestCaseResult result) {
        System.out.println("Status: " + judge0Result.status.description);
        
        String expectedOutput = testCase.getExpectedOutput().trim();
        String actualOutput = "";
        
        if (judge0Result.status.id == 3) { // Accepted
            actualOutput = judge0Result.stdout != null ? judge0Result.stdout.trim() : "";
            result.setPassed(actualOutput.equals(expectedOutput));
            if (!result.isPassed()) {
                result.setError("Wrong Answer");
            }
        } else if (judge0Result.status.id == 6) { // Compilation Error
            result.setPassed(false);
            result.setError("Compilation Error: " + 
                (judge0Result.compileOutput != null ? judge0Result.compileOutput : "Unknown"));
        } else if (judge0Result.status.id == 5 || judge0Result.status.id == 13) { // TLE
            result.setPassed(false);
            result.setError("Time Limit Exceeded");
        } else if (judge0Result.status.id == 4) { // Wrong Answer
            actualOutput = judge0Result.stdout != null ? judge0Result.stdout.trim() : "";
            result.setPassed(false);
            result.setError("Wrong Answer");
        } else { // Other runtime errors
            result.setPassed(false);
            result.setError("Runtime Error: " + judge0Result.status.description);
            if (judge0Result.stderr != null && !judge0Result.stderr.trim().isEmpty()) {
                result.setError(result.getError() + " - " + judge0Result.stderr.trim());
            }
        }
        
        result.setExpected(expectedOutput);
        result.setActual(actualOutput);
    }
    
    private Judge0Result pollForResult(String token) {
        int maxAttempts = 25;
        
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                Judge0Result result = webClient.get()
                    .uri("/submissions/" + token + "?base64_encoded=false&fields=*")
                    .retrieve()
                    .bodyToMono(Judge0Result.class)
                    .timeout(Duration.ofSeconds(3))
                    .block();
                
                if (result != null && result.status != null && result.status.id > 2) {
                    return result; // Done
                }
                
                // Progressive delay: start fast, slow down
                long delay = attempt < 10 ? 300 : 500;
                TimeUnit.MILLISECONDS.sleep(delay);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                System.err.println("Poll error: " + e.getMessage());
                try {
                    TimeUnit.MILLISECONDS.sleep(500);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        return null;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubmissionResponse {
        public String token;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Judge0Result {
        public String stdout;
        public String stderr;
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
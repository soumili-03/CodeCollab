package com.codecollab.v1.controller;

import com.codecollab.v1.dto.CodeSubmissionRequest;
import com.codecollab.v1.dto.ExecutionResult;
import com.codecollab.v1.entity.TestCase;
import com.codecollab.v1.service.CodeExecutionService;
import com.codecollab.v1.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "http://localhost:3001")
public class CodeExecutionController {
    
    @Autowired
    private CodeExecutionService executionService;
    
    @Autowired
    private ProblemService problemService;
    
    @PostMapping("/test")
    public ResponseEntity<ExecutionResult> testCode(@RequestBody CodeSubmissionRequest request) {
        try {
            // Validate input
            if (request.getProblemId() == null || request.getCode() == null || request.getLanguage() == null) {
                ExecutionResult result = new ExecutionResult("ERROR", "Missing required fields");
                return ResponseEntity.badRequest().body(result);
            }
            
            System.out.println("Testing code for problem: " + request.getProblemId());
            System.out.println("Language: " + request.getLanguage());
            System.out.println("Code length: " + request.getCode().length());
            
            // Check if problem exists
            if (!problemService.getProblemById(request.getProblemId()).isPresent()) {
                ExecutionResult result = new ExecutionResult("ERROR", "Problem not found");
                return ResponseEntity.notFound().build();
            }
            
            // Get sample test cases
            List<TestCase> sampleTestCases = problemService.getSampleTestCases(request.getProblemId());
            
            if (sampleTestCases.isEmpty()) {
                ExecutionResult result = new ExecutionResult("ERROR", "No sample test cases found");
                return ResponseEntity.ok(result);
            }
            
            ExecutionResult result = executionService.executeCode(
                request.getCode(), 
                request.getLanguage(), 
                sampleTestCases
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Test endpoint error: " + e.getMessage());
            e.printStackTrace();
            ExecutionResult errorResult = new ExecutionResult("ERROR", "Test failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResult);
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<ExecutionResult> submitCode(@RequestBody CodeSubmissionRequest request) {
        try {
            // Validate input
            if (request.getProblemId() == null || request.getCode() == null || request.getLanguage() == null) {
                ExecutionResult result = new ExecutionResult("ERROR", "Missing required fields");
                return ResponseEntity.badRequest().body(result);
            }
            
            System.out.println("Submitting code for problem: " + request.getProblemId());
            System.out.println("Language: " + request.getLanguage());
            
            // Check if problem exists
            if (!problemService.getProblemById(request.getProblemId()).isPresent()) {
                ExecutionResult result = new ExecutionResult("ERROR", "Problem not found");
                return ResponseEntity.notFound().build();
            }
            
            // Get all test cases
            List<TestCase> allTestCases = problemService.getTestCases(request.getProblemId());
            
            if (allTestCases.isEmpty()) {
                ExecutionResult result = new ExecutionResult("ERROR", "No test cases found");
                return ResponseEntity.ok(result);
            }
            
            ExecutionResult result = executionService.executeCode(
                request.getCode(), 
                request.getLanguage(), 
                allTestCases
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Submit endpoint error: " + e.getMessage());
            e.printStackTrace();
            ExecutionResult errorResult = new ExecutionResult("ERROR", "Submission failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResult);
        }
    }
    
    // Add a health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Code execution service is running");
    }
}

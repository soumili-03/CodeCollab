package com.codecollab.v1.controller;

import com.codecollab.v1.entity.Problem;
import com.codecollab.v1.entity.TestCase;
import com.codecollab.v1.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = "http://localhost:3001")
public class ProblemController {
    
    @Autowired
    private ProblemService problemService;
    
    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        List<Problem> problems = problemService.getAllProblems();
        return ResponseEntity.ok(problems);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id) {
        Optional<Problem> problem = problemService.getProblemById(id);
        return problem.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Problem>> getProblemsByDifficulty(@PathVariable Problem.Difficulty difficulty) {
        List<Problem> problems = problemService.getProblemsByDifficulty(difficulty);
        return ResponseEntity.ok(problems);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Problem>> getProblemsByCategory(@PathVariable String category) {
        List<Problem> problems = problemService.getProblemsByCategory(category);
        return ResponseEntity.ok(problems);
    }
    
    @GetMapping("/{id}/testcases")
    public ResponseEntity<List<TestCase>> getTestCases(@PathVariable Long id) {
        List<TestCase> testCases = problemService.getTestCases(id);
        return ResponseEntity.ok(testCases);
    }
    
    @GetMapping("/{id}/sample-testcases")
    public ResponseEntity<List<TestCase>> getSampleTestCases(@PathVariable Long id) {
        List<TestCase> testCases = problemService.getSampleTestCases(id);
        return ResponseEntity.ok(testCases);
    }
}
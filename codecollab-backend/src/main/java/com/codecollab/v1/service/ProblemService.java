package com.codecollab.v1.service;

import com.codecollab.v1.entity.Problem;
import com.codecollab.v1.entity.TestCase;
import com.codecollab.v1.repository.ProblemRepository;
import com.codecollab.v1.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProblemService {
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private TestCaseRepository testCaseRepository;
    
    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }
    
    public Optional<Problem> getProblemById(Long id) {
        return problemRepository.findById(id);
    }
    
    public List<Problem> getProblemsByDifficulty(Problem.Difficulty difficulty) {
        return problemRepository.findByDifficulty(difficulty);
    }
    
    public List<Problem> getProblemsByCategory(String category) {
        return problemRepository.findByCategory(category);
    }
    
    public List<TestCase> getTestCases(Long problemId) {
        return testCaseRepository.findByProblemId(problemId);
    }
    
    public List<TestCase> getSampleTestCases(Long problemId) {
        return testCaseRepository.findByProblemIdAndIsSample(problemId, true);
    }
    
    public Problem saveProblem(Problem problem) {
        return problemRepository.save(problem);
    }
}
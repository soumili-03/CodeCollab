package com.codecollab.v1;

import com.codecollab.v1.entity.Problem;
import com.codecollab.v1.entity.TestCase;
import com.codecollab.v1.repository.ProblemRepository;
import com.codecollab.v1.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private TestCaseRepository testCaseRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (problemRepository.count() == 0) {
            initializeProblems();
        }
    }
    
    private void initializeProblems() {
        // Problem 1: Two Sum
        Problem twoSum = new Problem();
        twoSum.setTitle("Two Sum");
        twoSum.setDifficulty(Problem.Difficulty.EASY);
        twoSum.setCategory("ARRAYS");
        twoSum.setDescription("Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.");
        twoSum.setInputFormat("First line contains n (length of array)\nSecond line contains n space-separated integers \nThird line contains target integer");
        twoSum.setOutputFormat("Two space-separated integers representing the indices (0-based)");
        twoSum.setSampleInput("4\n2 7 11 15\n9");
        twoSum.setSampleOutput("0 1");
        twoSum.setExplanation("nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]");
        
        problemRepository.save(twoSum);
        
        // Test cases for Two Sum
        createTestCase(twoSum, "4\n2 7 11 15\n9", "0 1", true, 10);
        createTestCase(twoSum, "3\n3 2 4\n6", "1 2", false, 15);
        createTestCase(twoSum, "2\n3 3\n6", "0 1", false, 15);
        
        // Problem 2: Reverse String
        Problem reverseString = new Problem();
        reverseString.setTitle("Reverse String");
        reverseString.setDifficulty(Problem.Difficulty.EASY);
        reverseString.setCategory("STRINGS");
        reverseString.setDescription("Write a function that reverses a string. The input string is given as an array of characters.");
        reverseString.setInputFormat("Single line containing a string");
        reverseString.setOutputFormat("Single line containing the reversed string");
        reverseString.setSampleInput("hello");
        reverseString.setSampleOutput("olleh");
        reverseString.setExplanation("Simply reverse the input string");
        
        problemRepository.save(reverseString);
        
        // Test cases for Reverse String
        createTestCase(reverseString, "hello", "olleh", true, 20);
        createTestCase(reverseString, "Hannah", "hannaH", false, 20);
        createTestCase(reverseString, "a", "a", false, 20);
        
        System.out.println("Sample problems initialized successfully!");
    }
    
    private void createTestCase(Problem problem, String input, String output, boolean isSample, int points) {
        TestCase testCase = new TestCase();
        testCase.setProblem(problem);
        testCase.setInputData(input);
        testCase.setExpectedOutput(output);
        testCase.setIsSample(isSample);
        testCase.setPoints(points);
        testCaseRepository.save(testCase);
    }
}
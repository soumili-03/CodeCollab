package com.codecollab.v1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class Judge0TestService {

    private final WebClient webClient;

    public Judge0TestService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Map runReverseStringTest() {
        // Example problem: reverse a string
        String code = """
                s = input()
                print(s[::-1])
                """;
        int languageId = 71; // Python 3.8.1

        // Example input/output for testing
        String stdin = "hello";        // program input
        String expectedOutput = "olleh\n"; // Judge0 expects newline at end usually

        // Request payload
        Map<String, Object> submission = new HashMap<>();
        submission.put("source_code", code);
        submission.put("language_id", languageId);
        submission.put("stdin", stdin);
        submission.put("expected_output", expectedOutput);

        // Call Judge0 API
        Map response = webClient.post()
                .uri("/submissions?base64_encoded=false&wait=true") // wait until execution finishes
                .header("Content-Type", "application/json")
                .bodyValue(submission)
                .retrieve()
                .bodyToMono(Map.class)
                .block(); // block = wait here and get response

        return response;
    }
}

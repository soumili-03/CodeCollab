package com.codecollab.v1.controller;

import com.codecollab.v1.service.Judge0TestService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class Judge0TestController {

    private final Judge0TestService judge0TestService;

    public Judge0TestController(Judge0TestService judge0TestService) {
        this.judge0TestService = judge0TestService;
    }

    @GetMapping("/test/judge0")
    public Map testJudge0() {
        return judge0TestService.runReverseStringTest();
    }
}

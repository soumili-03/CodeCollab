
package com.codecollab.v1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.core.task.TaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "codeExecutionTaskExecutor")
    public TaskExecutor codeExecutionTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);        // Minimum threads
        executor.setMaxPoolSize(5);         // Maximum threads
        executor.setQueueCapacity(100);     // Queue size
        executor.setThreadNamePrefix("CodeExecution-");
        executor.setKeepAliveSeconds(60);   // Thread keep-alive time
        executor.initialize();
        return executor;
    }
}

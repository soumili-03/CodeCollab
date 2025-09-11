package com.codecollab.v1.repository;

import com.codecollab.v1.entity.Submission;
import com.codecollab.v1.entity.Round;
import com.codecollab.v1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByRound(Round round);
    Optional<Submission> findByRoundAndUser(Round round, User user);
}

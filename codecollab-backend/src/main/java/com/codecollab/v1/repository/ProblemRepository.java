package com.codecollab.v1.repository;

import com.codecollab.v1.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByDifficulty(Problem.Difficulty difficulty);
    List<Problem> findByCategory(String category);
    List<Problem> findByDifficultyAndCategory(Problem.Difficulty difficulty, String category);
    
    // Add this method to fetch problem with all fields initialized
    @Query("SELECT p FROM Problem p WHERE p.id = :id")
    Optional<Problem> findByIdWithFullData(@Param("id") Long id);
}
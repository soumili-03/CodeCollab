package com.codecollab.v1.repository;

import com.codecollab.v1.entity.Round;
import com.codecollab.v1.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoundRepository extends JpaRepository<Round, Long> {
    List<Round> findByRoomOrderByRoundNumberDesc(Room room);
}

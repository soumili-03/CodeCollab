// RoomRepository.java
package com.codecollab.v1.repository;

import com.codecollab.v1.entity.Room;
import com.codecollab.v1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomCode(String roomCode);
    
    List<Room> findByHostAndStatus(User host, Room.RoomStatus status);
    
    // FIXED: Only get ACTIVE rooms where user is host
    @Query("SELECT r FROM Room r WHERE r.host = :user AND r.status IN ('WAITING', 'ACTIVE')")
    List<Room> findActiveRoomsByHost(@Param("user") User user);
    
    List<Room> findByHost(User host);
    
    List<Room> findByStatus(Room.RoomStatus status);
    
    // Cleanup old rooms
    @Query("SELECT r FROM Room r WHERE r.status = 'WAITING' AND r.createdAt < :cutoffTime")
    List<Room> findStaleWaitingRooms(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    boolean existsByRoomCode(String roomCode);
}
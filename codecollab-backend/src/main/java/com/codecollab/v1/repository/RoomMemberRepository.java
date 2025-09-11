// RoomMemberRepository.java
package com.codecollab.v1.repository;

import com.codecollab.v1.entity.Room;
import com.codecollab.v1.entity.RoomMember;
import com.codecollab.v1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    List<RoomMember> findByRoomAndStatus(Room room, RoomMember.MemberStatus status);
    
    Optional<RoomMember> findByRoomAndUser(Room room, User user);
    
    boolean existsByRoomAndUser(Room room, User user);
    
    @Query("SELECT rm FROM RoomMember rm WHERE rm.user = :user AND rm.status = 'JOINED'")
    List<RoomMember> findActiveRoomsByUser(@Param("user") User user);
    
    @Query("SELECT rm FROM RoomMember rm JOIN rm.room r WHERE rm.user = :user AND rm.status = 'JOINED' AND r.status IN ('WAITING', 'ACTIVE')")
    List<RoomMember> findActiveRoomMembershipsByUser(@Param("user") User user);
    
    // Get leaderboard for a room
    @Query("SELECT rm FROM RoomMember rm WHERE rm.room = :room AND rm.status = 'JOINED' " +
           "ORDER BY rm.submissionTime ASC, rm.score DESC")
    List<RoomMember> findRoomLeaderboard(@Param("room") Room room);
    
    long countByRoomAndStatus(Room room, RoomMember.MemberStatus status);
}
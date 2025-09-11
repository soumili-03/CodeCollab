package com.codecollab.v1.service;

import com.codecollab.v1.entity.Problem;
import com.codecollab.v1.entity.Room;
import com.codecollab.v1.entity.RoomMember;
import com.codecollab.v1.entity.User;
import com.codecollab.v1.repository.ProblemRepository;
import com.codecollab.v1.repository.RoomMemberRepository;
import com.codecollab.v1.repository.RoomRepository;
import com.codecollab.v1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoomService {
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private RoomMemberRepository roomMemberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired  
    private ProblemRepository problemRepository;
    
    private final SecureRandom random = new SecureRandom();
    private final String ROOM_CODE_CHARS = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; // No O, 0 for clarity
    
    public Room createRoom(String roomName, Room.RoomMode mode, User host) {
        // Check if user is already in an active room
        List<Room> activeRooms = getActiveRoomsByUser(host);
        if (!activeRooms.isEmpty()) {
            System.err.println("❌ User " + host.getUsername() + " is already in room: " + activeRooms.get(0).getRoomCode());
            throw new RuntimeException("User is already in an active room: " + activeRooms.get(0).getRoomCode());
        }
        
        // Generate unique room code
        String roomCode = generateUniqueRoomCode();
        
        // Create room
        Room room = new Room(roomCode, roomName, host, mode);
        Room savedRoom = roomRepository.save(room);
        
        // Add host as first member
        RoomMember hostMember = new RoomMember(savedRoom, host, RoomMember.MemberRole.HOST);
        roomMemberRepository.save(hostMember);
        
        System.out.println("✅ Created room: " + roomCode + " by " + host.getUsername());
        return savedRoom;
    }
    
    public Room joinRoom(String roomCode, User user) throws Exception {
        Optional<Room> roomOpt = roomRepository.findByRoomCode(roomCode.toUpperCase());
        
        if (roomOpt.isEmpty()) {
            throw new Exception("Room not found");
        }
        
        Room room = roomOpt.get();
        
        // Check if room can be joined
        if (!room.canJoin()) {
            if (room.isFull()) {
                throw new Exception("Room is full");
            } else {
                throw new Exception("Room is not accepting new members");
            }
        }
        
        // Check if user has existing membership
        Optional<RoomMember> existingMember = roomMemberRepository.findByRoomAndUser(room, user);
        
        if (existingMember.isPresent()) {
            RoomMember member = existingMember.get();
            
            // If user is already JOINED, they're already in the room
            if (member.getStatus() == RoomMember.MemberStatus.JOINED) {
                throw new Exception("You are already in this room");
            }
            
            // If user previously LEFT, allow them to rejoin
            if (member.getStatus() == RoomMember.MemberStatus.LEFT) {
                System.out.println("🔄 " + user.getUsername() + " rejoining room: " + roomCode);
                
                // Reactivate their membership
                member.setStatus(RoomMember.MemberStatus.JOINED);
                member.setJoinedAt(LocalDateTime.now()); // Update join time
                member.setLeftAt(null); // Clear left time
                roomMemberRepository.save(member);
                
                // Update room member count
                room.incrementMembers();
                roomRepository.save(room);
                
                System.out.println("✅ " + user.getUsername() + " successfully rejoined room: " + roomCode);
                return room;
            }
        }
        
        // Check if user is in another active room (only if no existing membership)
        List<RoomMember> activeRooms = roomMemberRepository.findActiveRoomMembershipsByUser(user);
        if (!activeRooms.isEmpty()) {
            throw new Exception("You are already in another room. Leave that room first.");
        }
        
        // Create new membership for first-time joiners
        RoomMember member = new RoomMember(room, user, RoomMember.MemberRole.MEMBER);
        roomMemberRepository.save(member);
        
        // Update room member count
        room.incrementMembers();
        roomRepository.save(room);
        
        System.out.println("✅ " + user.getUsername() + " joined room: " + roomCode + " for the first time");
        return room;
    }
    
    public void leaveRoom(Room room, User user) throws Exception {
        Optional<RoomMember> memberOpt = roomMemberRepository.findByRoomAndUser(room, user);
        
        if (memberOpt.isEmpty()) {
            System.out.println("⚠️ User " + user.getUsername() + " not found in room " + room.getRoomCode());
            throw new Exception("You are not in this room");
        }
        
        RoomMember member = memberOpt.get();
        
        // Check if user is already left
        if (member.getStatus() == RoomMember.MemberStatus.LEFT) {
            throw new Exception("You have already left this room");
        }
        
        System.out.println("🚪 " + user.getUsername() + " leaving room: " + room.getRoomCode() + " (was " + member.getRole() + ")");
        
        // If host is leaving and there are other ACTIVE members, transfer host
        long activeMembers = roomMemberRepository.countByRoomAndStatus(room, RoomMember.MemberStatus.JOINED);
        if (member.isHost() && activeMembers > 1) { // More than just this user
            transferHost(room, user);
        }
        
        // Mark member as left
        member.setStatus(RoomMember.MemberStatus.LEFT);
        member.setLeftAt(LocalDateTime.now());
        roomMemberRepository.save(member);
        
        // Update room member count (decrement)
        room.decrementMembers();
        
        // Recount active members after this user left
        long remainingActiveMembers = roomMemberRepository.countByRoomAndStatus(room, RoomMember.MemberStatus.JOINED);
        
        // If no active members left, cancel the room
        if (remainingActiveMembers == 0) {
            room.setStatus(Room.RoomStatus.ENDED);
            System.out.println("🗑️ Room " + room.getRoomCode() + " cancelled - no active members left");
        }
        
        roomRepository.save(room);
        System.out.println("✅ " + user.getUsername() + " successfully left room: " + room.getRoomCode());
        System.out.println("   Room status: " + room.getStatus() + ", Active members remaining: " + remainingActiveMembers);
    }
    
    private void transferHost(Room room, User currentHost) {
        // Find the first active non-host member
        List<RoomMember> activeMembers = 
            roomMemberRepository.findByRoomAndStatus(room, RoomMember.MemberStatus.JOINED);
        
        // First, remove host role from current host
        for (RoomMember member : activeMembers) {
            if (member.getUser().equals(currentHost)) {
                member.setRole(RoomMember.MemberRole.MEMBER);
                roomMemberRepository.save(member);
                break;
            }
        }
        
        // Then assign host to next available member
        for (RoomMember member : activeMembers) {
            if (!member.getUser().equals(currentHost)) {
                // Transfer host role
                member.setRole(RoomMember.MemberRole.HOST);
                roomMemberRepository.save(member);
                
                // Update room host
                room.setHost(member.getUser());
                //room.setHostUsername(member.getUser().getUsername()); // If you have this field
                roomRepository.save(room);
                
                System.out.println("✅ Host transferred from " + currentHost.getUsername() + 
                                 " to " + member.getUser().getUsername());
                break;
            }
        }
    }

    
    private String generateUniqueRoomCode() {
        String roomCode;
        int attempts = 0;
        
        do {
            roomCode = generateRoomCode();
            attempts++;
            
            // Safety check to prevent infinite loop
            if (attempts > 100) {
                throw new RuntimeException("Failed to generate unique room code after 100 attempts");
            }
        } while (roomRepository.existsByRoomCode(roomCode));
        
        return roomCode;
    }
    
    private String generateRoomCode() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            code.append(ROOM_CODE_CHARS.charAt(random.nextInt(ROOM_CODE_CHARS.length())));
        }
        return code.toString();
    }
    
    
    public Room pauseSession(String roomCode, User host) throws Exception {
        Room room = getRoomOrThrow(roomCode);
        
        // Verify user is the CURRENT host based on RoomMember role
        Optional<RoomMember> hostMember = roomMemberRepository.findByRoomAndUser(room, host);
        if (hostMember.isEmpty() || hostMember.get().getRole() != RoomMember.MemberRole.HOST) {
            throw new Exception("Only the current host can pause the session");
        }
        
        // Only pause if session is currently ACTIVE
        if (room.getStatus() != Room.RoomStatus.ACTIVE) {
            throw new Exception("Can only pause an active session");
        }
        
        // Clear the current problem and reset to WAITING
        room.setStatus(Room.RoomStatus.WAITING);
        room.setCurrentProblem(null);
        room.setStartTime(null);
        room.setEndTime(null);
        // Keep the time limit if it was set initially
        
        roomRepository.save(room);
        
        System.out.println("⏸ Session paused, room " + roomCode + " back to lobby (WAITING)");
        return room;
    }
    
    
    public Room resumeSession(String roomCode, Long problemId, User host) throws Exception {
        Room room = getRoomOrThrow(roomCode);

        if (!room.getHost().equals(host)) throw new Exception("Only host can resume session");
        if (room.getStatus() != Room.RoomStatus.PAUSED && room.getStatus() != Room.RoomStatus.DISCUSSION)
            throw new Exception("Can only resume from paused/discussion state");

        Problem problem = problemRepository.findById(problemId)
            .orElseThrow(() -> new Exception("Problem not found"));

        room.setCurrentProblem(problem);
        room.setStatus(Room.RoomStatus.ACTIVE);
        room.setStartTime(LocalDateTime.now());

        roomRepository.save(room);
        System.out.println("▶️ Session resumed in room " + roomCode);
        return room;
    }
    
    public Room startDiscussion(String roomCode, User host) throws Exception {
        Room room = getRoomOrThrow(roomCode);

        if (!room.getHost().equals(host)) throw new Exception("Only host can start discussion");
        if (room.getStatus() != Room.RoomStatus.ACTIVE) throw new Exception("Can only discuss after active session");

        room.setStatus(Room.RoomStatus.DISCUSSION);
        roomRepository.save(room);

        System.out.println("💬 Discussion started in room " + roomCode);
        return room;
    }

    private Room getRoomOrThrow(String roomCode) throws Exception {
        return roomRepository.findByRoomCode(roomCode.toUpperCase())
            .orElseThrow(() -> new Exception("Room not found"));
    }
    
    public void endSession(String roomCode, User host) throws Exception {
        Optional<Room> roomOpt = roomRepository.findByRoomCode(roomCode.toUpperCase());
        
        if (roomOpt.isEmpty()) {
            throw new Exception("Room not found");
        }
        
        Room room = roomOpt.get();
        
        // Verify user is the CURRENT host based on RoomMember role
        Optional<RoomMember> hostMember = roomMemberRepository.findByRoomAndUser(room, host);
        if (hostMember.isEmpty() || hostMember.get().getRole() != RoomMember.MemberRole.HOST) {
            throw new Exception("Only the current host can end the session");
        }
        
        // Update room state to ENDED (not COMPLETED)
        room.setStatus(Room.RoomStatus.ENDED);
        room.setEndTime(LocalDateTime.now());
        room.setCurrentProblem(null); // Clear the problem
        
        roomRepository.save(room);
        
        // Mark all members as LEFT to clean up their state
        List<RoomMember> members = roomMemberRepository.findByRoomAndStatus(room, 
                                                                           RoomMember.MemberStatus.JOINED);
        for (RoomMember member : members) {
            member.setStatus(RoomMember.MemberStatus.LEFT);
            member.setLeftAt(LocalDateTime.now());
            roomMemberRepository.save(member);
        }
        
        System.out.println("🔴 Session ended and room destroyed: " + roomCode);
    }
  
    
    // Getter methods
    public Optional<Room> findByRoomCode(String roomCode) {
        return roomRepository.findByRoomCode(roomCode.toUpperCase());
    }
    
    public List<RoomMember> getRoomMembers(Room room) {
        return roomMemberRepository.findByRoomAndStatus(room, RoomMember.MemberStatus.JOINED);
    }
    
    public List<Room> getActiveRoomsByUser(User user) {
        List<Room> activeRooms = new ArrayList<>();
        
        // Check if user is host of any active rooms
        List<Room> hostedRooms = roomRepository.findActiveRoomsByHost(user);
        activeRooms.addAll(hostedRooms);
        
        // Check if user is member of any active rooms  
        List<RoomMember> membershipRooms = roomMemberRepository.findActiveRoomMembershipsByUser(user);
        for (RoomMember membership : membershipRooms) {
            Room room = membership.getRoom();
            if (!activeRooms.contains(room)) { // Avoid duplicates
                activeRooms.add(room);
            }
        }
        
        System.out.println("🔍 Active rooms for " + user.getUsername() + ": " + activeRooms.size());
        for (Room room : activeRooms) {
            System.out.println("  - Room: " + room.getRoomCode() + " (Status: " + room.getStatus() + ")");
        }
        
        return activeRooms;
    }
    
    public boolean isUserInRoom(Room room, User user) {
        return roomMemberRepository.existsByRoomAndUser(room, user);
    }
    
    // Session Management Methods
    
    public Room startSession(String roomCode, Long problemId, User host, Integer timeLimit) throws Exception {
        Optional<Room> roomOpt = 
            roomRepository.findByRoomCode(roomCode.toUpperCase());
        
        if (roomOpt.isEmpty()) {
            throw new Exception("Room not found");
        }
        
        Room room = roomOpt.get();
        
        // IMPORTANT: Check if user is the CURRENT host based on RoomMember role
        Optional<RoomMember> hostMember = roomMemberRepository.findByRoomAndUser(room, host);
        if (hostMember.isEmpty() || hostMember.get().getRole() != RoomMember.MemberRole.HOST) {
            throw new Exception("Only the current host can start the session");
        }
        
        // Sync room's host field if needed
        if (!room.getHost().equals(host)) {
            System.out.println("⚠️ Syncing room host to match member role");
            room.setHost(host);
        }
        
        // Check room is in waiting state
        if (room.getStatus() != Room.RoomStatus.WAITING) {
            throw new Exception("Session has already started or room is not ready");
        }
        
        // Check minimum members (at least 2 for meaningful session)
        long activeMembers = roomMemberRepository.countByRoomAndStatus(room, 
                                                                      RoomMember.MemberStatus.JOINED);
        if (activeMembers < 2) {
            throw new Exception("Need at least 2 members to start session");
        }
        
        // Set the problem (we'll validate it exists)
        Problem problem = problemRepository.findById(problemId)
            .orElseThrow(() -> new Exception("Problem not found"));
        
        System.out.println("Setting problem ID: " + problemId + " for room: " + roomCode);
        System.out.println("Problem saved with title: " + problem.getTitle());
        
        // Update room state
        room.setCurrentProblem(problem);
        room.setStatus(Room.RoomStatus.ACTIVE);
        room.setStartTime(LocalDateTime.now());
        
        // Set time limit if provided
        if (timeLimit != null && timeLimit > 0) {
            room.setTimeLimit(timeLimit);
            room.setEndTime(room.getStartTime().plusMinutes(timeLimit));
        }
        
        roomRepository.save(room);
        
        System.out.println("🚀 Session started in room: " + roomCode + 
                         " with problem: " + problem.getTitle() + 
                         (timeLimit != null ? " (Time limit: " + timeLimit + " min)" : ""));
        
        return room;
    }
    
    public Room getCurrentSession(String roomCode, User user) throws Exception {
        Optional<Room> roomOpt = 
            roomRepository.findByRoomCode(roomCode.toUpperCase());
        
        if (roomOpt.isEmpty()) {
            throw new Exception("Room not found");
        }
        
        Room room = roomOpt.get();
        
        // Check if user is in this room (member or host)
        Optional<RoomMember> memberOpt = 
            roomMemberRepository.findByRoomAndUser(room, user);
        if (memberOpt.isEmpty() || memberOpt.get().getStatus() != RoomMember.MemberStatus.JOINED) {
            throw new Exception("You are not an active member of this room");
        }
        
        // IMPORTANT: Always sync the host from RoomMember table
        // This ensures we get the current host, not cached one
        List<RoomMember> members = roomMemberRepository.findByRoomAndStatus(room, RoomMember.MemberStatus.JOINED);
        for (RoomMember member : members) {
            if (member.getRole() == RoomMember.MemberRole.HOST) {
                // Update room's host to match current HOST in members
                if (!room.getHost().equals(member.getUser())) {
                    System.out.println("⚠️ Host mismatch detected, syncing...");
                    room.setHost(member.getUser());
                    roomRepository.save(room);
                }
                break;
            }
        }
        
        // For active sessions, ensure problem is fully loaded
        if (room.getStatus() == Room.RoomStatus.ACTIVE) {
            if (room.getCurrentProblem() == null) {
                throw new Exception("No problem set for this session");
            }
            
            // Force load complete problem data
            Long problemId = room.getCurrentProblem().getId();
            Optional<Problem> fullProblem = problemRepository.findById(problemId);
            
            if (fullProblem.isPresent()) {
                room.setCurrentProblem(fullProblem.get());
                System.out.println("Loaded problem for user " + user.getUsername() + 
                                 ": " + fullProblem.get().getTitle());
            } else {
                throw new Exception("Problem data not found");
            }
        }
        
        return room;
    }
    
    
}
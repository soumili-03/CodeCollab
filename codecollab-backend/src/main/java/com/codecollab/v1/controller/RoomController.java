package com.codecollab.v1.controller;

import com.codecollab.v1.dto.*;
import com.codecollab.v1.entity.Room;
import com.codecollab.v1.entity.RoomMember;
import com.codecollab.v1.entity.User;
import com.codecollab.v1.service.RoomService;
import com.codecollab.v1.service.UserService;
import com.codecollab.v1.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {
    
    @Autowired
    private RoomService roomService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest request,
                                       @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            // Check if user is already in an active room
            List<Room> activeRooms = roomService.getActiveRoomsByUser(user);
            if (!activeRooms.isEmpty()) {
                return ResponseEntity.badRequest().body("You are already in an active room");
            }
            
            Room room = roomService.createRoom(request.getRoomName(), request.getMode(), user);
            if (request.getTimeLimit() != null) {
                room.setTimeLimit(request.getTimeLimit());
            }
            
            // Get room members for response
            List<RoomMember> members = roomService.getRoomMembers(room);
            List<RoomMemberInfo> memberInfos = members.stream()
                    .map(RoomMemberInfo::fromRoomMember)
                    .collect(Collectors.toList());
            
            RoomResponse response = RoomResponse.fromRoom(room, memberInfos);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create room: " + e.getMessage());
        }
    }
    
    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody JoinRoomRequest request,
                                     @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            Room room = roomService.joinRoom(request.getRoomCode(), user);
            
            // Get updated room members
            List<RoomMember> members = roomService.getRoomMembers(room);
            List<RoomMemberInfo> memberInfos = members.stream()
                    .map(RoomMemberInfo::fromRoomMember)
                    .collect(Collectors.toList());
            
            RoomResponse response = RoomResponse.fromRoom(room, memberInfos);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/leave/{roomCode}")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomCode,
                                      @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Room not found");
            }
            
            roomService.leaveRoom(roomOpt.get(), user);
            return ResponseEntity.ok("Left room successfully");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{roomCode}")
    public ResponseEntity<?> getRoomDetails(@PathVariable String roomCode,
                                           @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            Optional<Room> roomOpt = roomService.findByRoomCode(roomCode);
            if (roomOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Room not found");
            }
            
            Room room = roomOpt.get();
            
            // Check if user is in this room
            if (!roomService.isUserInRoom(room, user)) {
                return ResponseEntity.status(403).body("You are not a member of this room");
            }
            
            List<RoomMember> members = roomService.getRoomMembers(room);
            List<RoomMemberInfo> memberInfos = members.stream()
                    .map(RoomMemberInfo::fromRoomMember)
                    .collect(Collectors.toList());
            
            RoomResponse response = RoomResponse.fromRoom(room, memberInfos);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get room details: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-rooms")
    public ResponseEntity<?> getMyRooms(@RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            List<Room> rooms = roomService.getActiveRoomsByUser(user);
            List<RoomResponse> responses = rooms.stream()
                    .map(room -> {
                        List<RoomMember> members = roomService.getRoomMembers(room);
                        List<RoomMemberInfo> memberInfos = members.stream()
                                .map(RoomMemberInfo::fromRoomMember)
                                .collect(Collectors.toList());
                        return RoomResponse.fromRoom(room, memberInfos);
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get rooms: " + e.getMessage());
        }
    }
    
    @PostMapping("/{roomCode}/start")
    public ResponseEntity<?> startSession(@PathVariable String roomCode,
                                         @RequestBody StartSessionRequest request,
                                         @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            Room room = roomService.startSession(roomCode, request.getProblemId(), user, request.getTimeLimit());
            
            // Get updated room members
            List<RoomMember> members = roomService.getRoomMembers(room);
            List<RoomMemberInfo> memberInfos = members.stream()
                    .map(RoomMemberInfo::fromRoomMember)
                    .collect(Collectors.toList());
            
            RoomSessionResponse response = RoomSessionResponse.fromRoom(room, memberInfos);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{roomCode}/session")
    public ResponseEntity<?> getCurrentSession(@PathVariable String roomCode,
                                              @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                System.err.println("Unauthorized access attempt to session");
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            System.out.println("Session request from: " + user.getUsername() + " for room: " + roomCode);
            
            // Get the complete session data
            Room room = roomService.getCurrentSession(roomCode, user);
            
            // Log the current state
            System.out.println("Room found - Status: " + room.getStatus());
            System.out.println("Current Problem: " + 
                              (room.getCurrentProblem() != null ? room.getCurrentProblem().getTitle() : "NULL"));
            
            // Get all active members
            List<RoomMember> members = roomService.getRoomMembers(room);
            List<RoomMemberInfo> memberInfos = members.stream()
                .map(RoomMemberInfo::fromRoomMember)
                .collect(Collectors.toList());
            
            // Create response with complete data
            RoomSessionResponse response = RoomSessionResponse.fromRoom(room, memberInfos);
            
            // Verify response has problem data
            if (response.getProblem() == null && room.getStatus() == Room.RoomStatus.ACTIVE) {
                System.err.println("WARNING: Active session but no problem in response for user: " + 
                                  user.getUsername());
            }
            
            System.out.println("Sending session response to " + user.getUsername() + 
                              " with problem: " + (response.getProblem() != null ? 
                              response.getProblem().getTitle() : "NULL"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting session for user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/{roomCode}/end")
    public ResponseEntity<?> endSession(@PathVariable String roomCode,
                                       @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            
            roomService.endSession(roomCode, user);
            return ResponseEntity.ok("Session ended successfully");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private User getUserFromToken(String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            if (jwtUtil.validateToken(jwt)) {
                String username = jwtUtil.getUsernameFromToken(jwt);
                return userService.findByUsername(username).orElse(null);
            }
        } catch (Exception e) {
            System.err.println("Token validation error: " + e.getMessage());
        }
        return null;
    }
    
    
    @PostMapping("/{roomCode}/pause")
    public ResponseEntity<?> pauseSession(@PathVariable String roomCode,
                                         @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) return ResponseEntity.status(401).body("Unauthorized");
            Room room = roomService.pauseSession(roomCode, user);
            return ResponseEntity.ok(RoomResponse.fromRoom(room, memberInfos(room)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{roomCode}/resume")
    public ResponseEntity<?> resumeSession(@PathVariable String roomCode,
                                           @RequestBody StartSessionRequest request,
                                           @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) return ResponseEntity.status(401).body("Unauthorized");
            Room room = roomService.resumeSession(roomCode, request.getProblemId(), user);
            return ResponseEntity.ok(RoomResponse.fromRoom(room, memberInfos(room)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{roomCode}/discussion")
    public ResponseEntity<?> startDiscussion(@PathVariable String roomCode,
                                             @RequestHeader("Authorization") String token) {
        try {
            User user = getUserFromToken(token);
            if (user == null) return ResponseEntity.status(401).body("Unauthorized");
            Room room = roomService.startDiscussion(roomCode, user);
            return ResponseEntity.ok(RoomResponse.fromRoom(room, memberInfos(room)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private List<RoomMemberInfo> memberInfos(Room room) {
        return roomService.getRoomMembers(room).stream()
            .map(RoomMemberInfo::fromRoomMember)
            .collect(Collectors.toList());
    }

}
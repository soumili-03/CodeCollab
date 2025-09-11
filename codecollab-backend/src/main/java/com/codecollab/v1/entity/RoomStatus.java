package com.codecollab.v1.entity;

public enum RoomStatus {
    WAITING,    // Lobby, waiting to start
    ACTIVE,     // Round in progress
    PAUSED,     // Host pressed Back to Lobby
    DISCUSSION, // Discussion phase
    ENDED,      // Room closed
    ARCHIVED    // optional future use
}

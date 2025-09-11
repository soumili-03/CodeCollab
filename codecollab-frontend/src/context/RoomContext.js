// src/context/RoomContext.js - Fixed version with proper session ending
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomLoading, setRoomLoading] = useState(false);
  
  // Add polling interval ref to clean up on unmount
  const pollingInterval = React.useRef(null);

  // Room API functions
  const createRoom = async (roomData) => {
    setRoomLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8083/api/rooms/create', roomData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentRoom(response.data);
      setIsInRoom(true);
      return { success: true, room: response.data };
    } catch (error) {
      console.error('Failed to create room:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to create room'
      };
    } finally {
      setRoomLoading(false);
    }
  };

  const joinRoom = async (roomCode) => {
    setRoomLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8083/api/rooms/join',
        { roomCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentRoom(response.data);
      setIsInRoom(true);
      return { success: true, room: response.data };
    } catch (error) {
      console.error('Failed to join room:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to join room'
      };
    } finally {
      setRoomLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom) return { success: true };
    
    setRoomLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8083/api/rooms/leave/${currentRoom.roomCode}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Left room successfully:', currentRoom.roomCode);
      
      // Clear room state
      setCurrentRoom(null);
      setCurrentSession(null);
      setIsInRoom(false);
      
      // Clear any polling
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to leave room:', error);
      // Clear state even on error
      setCurrentRoom(null);
      setCurrentSession(null);
      setIsInRoom(false);
      
      return {
        success: false,
        message: error.response?.data || 'Failed to leave room'
      };
    } finally {
      setRoomLoading(false);
    }
  };

  const getRoomDetails = async (roomCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8083/api/rooms/${roomCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if room has ended - if so, trigger cleanup
      if (response.data.status === 'ENDED' || response.data.status === 'COMPLETED') {
        console.log('Room has ended, cleaning up...');
        handleRoomEnded();
        return { success: false, message: 'Room has ended' };
      }
      
      // Update current room if it's the same room
      if (currentRoom && currentRoom.roomCode === roomCode) {
        setCurrentRoom(response.data);
      }
      
      return { success: true, room: response.data };
    } catch (error) {
      console.error('Failed to get room details:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to get room details'
      };
    }
  };

  const getMyRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8083/api/rooms/my-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { success: true, rooms: response.data };
    } catch (error) {
      console.error('Failed to get my rooms:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to get rooms'
      };
    }
  };

  // Session Management APIs
  const startSession = async (problemId, timeLimit = null) => {
    if (!currentRoom) return { success: false, message: 'No active room' };
    
    setRoomLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8083/api/rooms/${currentRoom.roomCode}/start`,
        { problemId, timeLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Session started:', response.data);
      
      // Update both room and session state
      setCurrentRoom(prevRoom => ({
        ...prevRoom,
        status: 'ACTIVE',
        currentProblem: response.data.problem
      }));
      
      setCurrentSession(response.data);
      
      return { success: true, session: response.data };
    } catch (error) {
      console.error('Failed to start session:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to start session'
      };
    } finally {
      setRoomLoading(false);
    }
  };

  const getCurrentSession = async (roomCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8083/api/rooms/${roomCode}/session`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Current session fetched:', response.data);
      
      // Update session state
      setCurrentSession(response.data);
      
      // Also update room state if needed
      if (response.data.problem) {
        setCurrentRoom(prevRoom => ({
          ...prevRoom,
          status: 'ACTIVE',
          currentProblem: response.data.problem
        }));
      }
      
      return { success: true, session: response.data };
    } catch (error) {
      console.error('Failed to get session:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to get session'
      };
    }
  };

  // Fixed endSession to properly handle room cleanup and navigation
  const endSession = async () => {
    if (!currentRoom) return { success: false, message: 'No active room' };
    
    setRoomLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8083/api/rooms/${currentRoom.roomCode}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Session ended, cleaning up...');
      
      // Clean up all state immediately
      handleRoomEnded();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to end session:', error);
      // Clean up state even on error
      handleRoomEnded();
      return {
        success: false,
        message: error.response?.data || 'Failed to end session'
      };
    } finally {
      setRoomLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!currentRoom) return { success: false, message: 'No active room' };
    
    setRoomLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8083/api/rooms/${currentRoom.roomCode}/pause`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Session paused, back to lobby');
      
      // Update room back to WAITING, clear session but keep room
      setCurrentSession(null);
      setCurrentRoom(prevRoom => ({
        ...prevRoom,
        status: 'WAITING',
        currentProblem: null
      }));
      
      // Optionally refresh room details to get updated member list
      await getRoomDetails(currentRoom.roomCode);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to pause session:', error);
      return {
        success: false,
        message: error.response?.data || 'Failed to pause session'
      };
    } finally {
      setRoomLoading(false);
    }
  };

  // Helper function to handle room ending
  const handleRoomEnded = () => {
    console.log('Room ended - cleaning up state');
    
    // Clear all room-related state
    setCurrentRoom(null);
    setCurrentSession(null);
    setIsInRoom(false);
    
    // Clear any polling intervals
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Start polling for room status changes
  const startRoomStatusPolling = (roomCode) => {
    // Clear existing interval if any
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    pollingInterval.current = setInterval(async () => {
      const result = await getRoomDetails(roomCode);
      if (!result.success || result.room?.status === 'ENDED') {
        // Room has ended, stop polling
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }, 3000); // Poll every 3 seconds
  };

  // Check if user is currently in a room on app load
  useEffect(() => {
    const checkCurrentRoom = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const result = await getMyRooms();
        if (result.success && result.rooms.length > 0) {
          // Filter out ended/completed rooms
          const activeRooms = result.rooms.filter(
            room => room.status !== 'ENDED' && room.status !== 'COMPLETED'
          );
          
          if (activeRooms.length > 0) {
            const activeRoom = activeRooms[0];
            setCurrentRoom(activeRoom);
            setIsInRoom(true);
            
            // Start polling for this room
            startRoomStatusPolling(activeRoom.roomCode);
            
            // If room has active session, fetch it
            if (activeRoom.status === 'ACTIVE') {
              await getCurrentSession(activeRoom.roomCode);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check current room:', error);
      }
    };
    
    checkCurrentRoom();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const value = {
    currentRoom,
    currentSession,
    isInRoom,
    roomLoading,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomDetails,
    getMyRooms,
    setCurrentRoom,
    setIsInRoom,
    // Session management
    startSession,
    getCurrentSession,
    endSession,
    pauseSession,
    handleRoomEnded,
    startRoomStatusPolling
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
// src/services/roomService.js
import api from './api';


export const getCurrentSession = async (roomCode) => {
  try {
    const res = await api.get(`/rooms/${roomCode}/session`);
    return { success: true, session: res.data };
  } catch (err) {
    console.error("❌ Failed to get current session:", err);
    return { success: false, message: err.response?.data?.message || "Server error" };
  }
};
// src/components/room/JoinRoomModal.jsx
import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';

const JoinRoomModal = ({ isOpen, onClose, onSuccess }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { joinRoom } = useRoom();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomCode.trim()) {
      setError('Room code is required');
      return;
    }

    if (roomCode.length < 6) {
      setError('Room code must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await joinRoom(roomCode.trim().toUpperCase());

      if (result.success) {
        onSuccess(result.room);
        onClose();
        setRoomCode(''); // Reset form
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCodeChange = (e) => {
    // Convert to uppercase and limit to 8 characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setRoomCode(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800/95 backdrop-blur-md border border-purple-500/20 
      rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">⚡ Join Room</h2>
          <p className="text-purple-300">Enter the room code to join the session</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Code Input */}
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Room Code
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={roomCode}
                onChange={handleRoomCodeChange}
                className="w-full px-4 py-4 bg-slate-700/50 border border-purple-500/30 rounded-xl 
                text-white text-center text-2xl font-mono font-bold tracking-wider placeholder-gray-400 
                focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ABC123"
                maxLength={8}
              />
              {/* Character count */}
              <div className="absolute -bottom-6 right-0 text-xs text-gray-400">
                {roomCode.length}/8
              </div>
            </div>
          </div>

          {/* Room Code Format Help */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Room Code Format
            </h4>
            <p className="text-purple-300 text-sm">
              Room codes are 6-8 characters long and contain letters and numbers (e.g., <code className="bg-slate-600/50 px-1 rounded">ABC123</code> or <code className="bg-slate-600/50 px-1 rounded">XYZ789AB</code>).
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || roomCode.length < 6}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 
            hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold 
            rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Joining Room...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>Join Room</span>
              </span>
            )}
          </button>
        </form>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-purple-300 text-xs mb-2">
            Ask your friend for the room code they received after creating the room.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>👥 Max 4 members</span>
            <span>•</span>
            <span>🔒 Private rooms only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
// src/components/room/CreateRoomModal.jsx
import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';

const CreateRoomModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    roomName: '',
    mode: 'PRACTICE',
    timeLimit: 30 // default 30 minutes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createRoom } = useRoom();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setLoading(true);
    try {
      const result = await createRoom({
        roomName: formData.roomName.trim(),
        mode: formData.mode,
        timeLimit: formData.mode === 'TOURNAMENT' ? formData.timeLimit : null
      });

      if (result.success) {
        onSuccess(result.room);
        onClose();
        // Reset form
        setFormData({ roomName: '', mode: 'PRACTICE', timeLimit: 30 });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold text-white mb-2">🚀 Create Room</h2>
          <p className="text-purple-300">Set up a coding session with friends</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Room Name
            </label>
            <input
              type="text"
              required
              value={formData.roomName}
              onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl 
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter room name (e.g., 'Team Alpha Session')"
              maxLength={50}
            />
          </div>

          {/* Room Mode */}
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Session Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'PRACTICE' })}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.mode === 'PRACTICE'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-purple-500/30 text-purple-300 hover:border-purple-500/50'
                }`}
              >
                <div className="text-2xl mb-1">🤝</div>
                <div className="font-semibold">Practice</div>
                <div className="text-xs opacity-75">Collaborative learning</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'TOURNAMENT' })}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.mode === 'TOURNAMENT'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-purple-500/30 text-purple-300 hover:border-purple-500/50'
                }`}
              >
                <div className="text-2xl mb-1">⚔️</div>
                <div className="font-semibold">Tournament</div>
                <div className="text-xs opacity-75">Competitive coding</div>
              </button>
            </div>
          </div>

          {/* Time Limit (only for Tournament mode) */}
          {formData.mode === 'TOURNAMENT' && (
            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">
                Time Limit (minutes)
              </label>
              <select
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl 
                text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          )}

          {/* Mode Description */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">
              {formData.mode === 'PRACTICE' ? '🤝 Practice Mode' : '⚔️ Tournament Mode'}
            </h4>
            <p className="text-purple-300 text-sm">
              {formData.mode === 'PRACTICE'
                ? 'Collaborative environment with voice chat, shared notes, and open discussion. Perfect for learning together!'
                : 'Competitive environment with time limits and rankings. Voice chat disabled during coding. May the best coder win!'
              }
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 
            hover:to-blue-700 disabled:from-purple-800 disabled:to-blue-800 text-white font-semibold 
            rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating Room...' : 'Create Room 🚀'}
          </button>
        </form>

        {/* Info */}
        <div className="mt-4 text-center">
          <p className="text-purple-300 text-xs">
            Room will be created instantly. Share the room code with up to 3 friends!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
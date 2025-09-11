// src/components/room/RoomLobby.jsx
import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import ProblemSelectionModal from './ProblemSelectionModal';

const RoomLobby = ({ onStartSession, onBackToHome }) => {
  const { 
    currentRoom, 
    leaveRoom, 
    getRoomDetails, 
    startSession, 
    getCurrentSession,
    endSession,
    handleRoomEnded 
  } = useRoom();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProblemSelection, setShowProblemSelection] = useState(false);
  
  // Auto-refresh room details every 3 seconds and check for room ending
  useEffect(() => {
    if (!currentRoom) return;
    
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Refreshing room details...', currentRoom.roomCode);
        const result = await getRoomDetails(currentRoom.roomCode);
        
        if (result.success) {
          // Check if room has ended
          if (result.room.status === 'ENDED') {
            console.log('⚠️ Room has been ended by host');
            handleRoomEnded();
            onBackToHome();
            return;
          }
          console.log('✅ Room refreshed, members:', result.room.members?.length);
        } else if (result.message === 'Room has ended') {
          // Room has ended, navigate home
          console.log('⚠️ Room has ended');
          handleRoomEnded();
          onBackToHome();
        }
      } catch (error) {
        console.error('❌ Failed to refresh room details:', error);
      }
    }, 3000); // Refresh every 3 seconds
    
    return () => clearInterval(interval);
  }, [currentRoom, getRoomDetails, handleRoomEnded, onBackToHome]);
  
  const handleCopyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleLeaveRoom = async () => {
    setLoading(true);
    try {
      await leaveRoom();
      onBackToHome();
    } catch (error) {
      console.error('Failed to leave room:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartSession = () => {
    setShowProblemSelection(true);
  };
  
  const handleProblemSelected = async (problemId, timeLimit) => {
    console.log('🎯 Starting session with problem:', problemId, 'Time limit:', timeLimit);
    const result = await startSession(problemId, timeLimit);
    
    if (result.success) {
      console.log('✅ Session started successfully!');
      // Trigger the parent component's callback
      onStartSession(result.session);
    } else {
      console.error('❌ Failed to start session:', result.message);
      alert('Failed to start session: ' + result.message);
    }
  };
  
  // Handler for End Session button (host only)
  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end the session? This will permanently close the room for all members.')) {
      setLoading(true);
      const result = await endSession();
      
      if (result.success) {
        // Navigate to home after successful end
        console.log('Room ended successfully, navigating home...');
        onBackToHome(); // Use the prop callback instead of navigate directly
      } else {
        alert('Failed to end session: ' + result.message);
        setLoading(false);
      }
    }
  };
  
  // Check if session becomes active
  useEffect(() => {
    const goActiveIfNeeded = async () => {
      if (currentRoom?.status === 'ACTIVE') {
        const res = await getCurrentSession(currentRoom.roomCode);
        if (res.success) {
          onStartSession(res.session);
          setShowProblemSelection(false);
        }
      }
    };
    goActiveIfNeeded();
  }, [currentRoom?.status, currentRoom?.roomCode, getCurrentSession, onStartSession]);
  
  // Determine current host from members list, not cached hostUsername
  const currentHost = currentRoom?.members?.find(m => m.role === 'HOST');
  const isHost = currentHost?.username === user?.username;
  const canStart = currentRoom?.members?.length >= 2; // At least 2 members to start
  
  if (!currentRoom) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Room Not Found</h2>
        <p className="text-purple-300 mb-4">The room you're looking for doesn't exist.</p>
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Room Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{currentRoom.roomName}</h1>
            <div className="flex items-center space-x-4 text-purple-300">
              <span className="flex items-center space-x-2">
                <span>{currentRoom.mode === 'PRACTICE' ? '🤝' : '⚔️'}</span>
                <span>{currentRoom.mode === 'PRACTICE' ? 'Practice Mode' : 'Tournament Mode'}</span>
              </span>
              {currentRoom.timeLimit && (
                <span className="flex items-center space-x-2">
                  <span>⏱️</span>
                  <span>{currentRoom.timeLimit} min</span>
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-300 mb-1">Room Code</div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-mono font-bold text-yellow-400 bg-slate-700/50 px-4 py-2 rounded-lg">
                {currentRoom.roomCode}
              </span>
              <button
                onClick={handleCopyRoomCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Copy room code"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Room Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
              {currentRoom.status === 'WAITING' ? '⏳ Waiting for members' : currentRoom.status}
            </span>
            <span className="text-purple-300">
              👥 {currentRoom.currentMembers}/{currentRoom.maxMembers} members
            </span>
          </div>
          {isHost && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              👑 Room Host
            </span>
          )}
        </div>
      </div>
      
      {/* Members List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>👥</span>
          <span>Members ({currentRoom.members?.length || 0})</span>
        </h2>
        <div className="grid gap-4">
          {currentRoom.members?.map((member, index) => (
            <div
              key={member.username}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {member.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{member.username}</span>
                    {member.role === 'HOST' && (
                      <span className="text-yellow-400 text-sm">👑</span>
                    )}
                  </div>
                  <div className="text-purple-300 text-sm">
                    Rating: {member.rating || 1200}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                  {member.status === 'JOINED' ? '🟢 Online' : '🔴 Offline'}
                </span>
                <div className="text-purple-300 text-sm">
                  Joined {new Date(member.joinedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: currentRoom.maxMembers - (currentRoom.members?.length || 0) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="flex items-center justify-center p-4 bg-slate-700/10 border-2 border-dashed border-purple-500/30 rounded-xl"
            >
              <div className="text-center text-purple-300">
                <div className="text-2xl mb-1">🤷</div>
                <div className="text-sm">Waiting for member...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mode Description */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-3">
          {currentRoom.mode === 'PRACTICE' ? '🤝 Practice Mode' : '⚔️ Tournament Mode'}
        </h3>
        <p className="text-purple-300 mb-4">
          {currentRoom.mode === 'PRACTICE'
            ? 'Collaborative environment where you can discuss problems, share notes, and help each other learn. Voice chat and screen sharing are enabled.'
            : 'Competitive coding session with time limits and rankings. Voice chat is disabled during the coding phase. The fastest correct solution wins!'
          }
        </p>
        {currentRoom.mode === 'PRACTICE' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-400">
              <span>✅</span>
              <span>Voice chat enabled</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <span>✅</span>
              <span>Shared notes</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <span>✅</span>
              <span>Open discussion</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-orange-400">
              <span>⚡</span>
              <span>Time limit: {currentRoom.timeLimit}min</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <span>🏆</span>
              <span>Ranked by speed</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <span>🤐</span>
              <span>No voice during coding</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {/* Leave Room - always visible */}
        <button
          onClick={handleLeaveRoom}
          disabled={loading}
          className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl"
        >
          {loading ? 'Leaving...' : '🚪 Leave Room'}
        </button>
        
        {isHost ? (
          <div className="flex space-x-3">
            {/* End Room button for host */}
            <button
              onClick={handleEndSession}
              disabled={loading}
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl disabled:opacity-50"
            >
              {loading ? 'Ending...' : 'End Room'}
            </button>
            
            {/* Start session (if conditions met) */}
            <button
              onClick={handleStartSession}
              disabled={!canStart}
              className={`px-8 py-4 font-bold rounded-xl transition-all ${canStart
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              🚀 Select Problem & Start
            </button>
          </div>
        ) : (
          <div className="text-center text-purple-300">
            <div className="text-sm mb-1">Waiting for host to start...</div>
            <div className="text-xs opacity-75">👑 {currentHost?.username || 'Host'} will start the session</div>
          </div>
        )}
      </div>
      
      {/* Copy success message */}
      {copied && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ Room code copied to clipboard!
        </div>
      )}
      
      {/* Problem Selection Modal */}
      <ProblemSelectionModal
        isOpen={showProblemSelection}
        onClose={() => setShowProblemSelection(false)}
        onSelectProblem={handleProblemSelected}
        roomMode={currentRoom?.mode}
      />
    </div>
  );
};

export default RoomLobby;
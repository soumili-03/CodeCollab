// src/components/room/ActiveSessionWorkspace.jsx
import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { codeExecutionAPI } from '../../services/api';
import ProblemDetail from '../problem/ProblemDetail';
import CodeEditor from '../editor/CodeEditor';
import ResultsModal from '../common/ResultsModal';

const ActiveSessionWorkspace = ({ onEndSession, onBackToLobby, onBackToHome }) => {
  const { 
    currentRoom, 
    currentSession, 
    getCurrentSession, 
    leaveRoom, 
    getRoomDetails, 
    handleRoomEnded,
    endSession 
  } = useRoom();
  const { user } = useAuth();
  
  // Session state
  const [sessionData, setSessionData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Code execution state
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  
  // UI state
  const [showProblem, setShowProblem] = useState(true);
  
  // Fetch session data on mount and refresh periodically
  useEffect(() => {
    if (!currentRoom?.roomCode) {
      setError('No active room found');
      setLoading(false);
      return;
    }
    
    const fetchSessionData = async () => {
      try {
        // First check if room still exists and hasn't ended
        const roomResult = await getRoomDetails(currentRoom.roomCode);
        
        if (!roomResult.success || 
            roomResult.room?.status === 'ENDED' || 
            roomResult.room?.status === 'COMPLETED') {
          console.log('Room has ended, navigating home...');
          handleRoomEnded();
          onBackToHome();
          return;
        }
        
        // Use context method to get session
        const result = await getCurrentSession(currentRoom.roomCode);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch session');
        }
        
        const data = result.session || currentSession;
        console.log('Session data received:', data);
        
        // Ensure we have the expected structure
        const sessionInfo = {
          roomId: data.roomId || currentRoom.id,
          roomCode: data.roomCode || currentRoom.roomCode,
          roomName: data.roomName || currentRoom.roomName,
          mode: data.mode || currentRoom.mode,
          status: data.status || 'ACTIVE',
          problem: data.problem,
          members: data.members || [],
          // Don't use cached hostUsername - always get current host from members
          hostUsername: data.members?.find(m => m.role === 'HOST')?.username,
          startTime: data.startTime,
          endTime: data.endTime,
          timeLimit: data.timeLimit,
          remainingTimeMinutes: data.remainingTimeMinutes
        };
        
        setSessionData(sessionInfo);
        
        if (sessionInfo.remainingTimeMinutes !== undefined) {
          setRemainingTime(sessionInfo.remainingTimeMinutes);
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchSessionData();
    
    // Auto-refresh every 5 seconds to detect room ending
    const interval = setInterval(fetchSessionData, 5000);
    
    return () => clearInterval(interval);
  }, [currentRoom, getCurrentSession, getRoomDetails, handleRoomEnded, onBackToHome, currentSession]);
  
  // Timer countdown
  useEffect(() => {
    if (remainingTime === null || remainingTime === undefined) return;
    
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) {
          // Session time expired
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [remainingTime]);
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  const handleCodeSubmit = async (code, language) => {
    if (!sessionData?.problem?.id) {
      alert('No problem loaded');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await codeExecutionAPI.submitCode(
        sessionData.problem.id,
        code,
        language
      );
      
      setResults({
        type: 'submit',
        ...response.data
      });
      setShowResults(true);
    } catch (error) {
      console.error('Submission error:', error);
      setResults({
        type: 'submit',
        status: 'ERROR',
        message: 'Submission failed: ' + error.message,
        passedTestCases: 0,
        totalTestCases: 0
      });
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCodeTest = async (code, language) => {
    if (!sessionData?.problem?.id) {
      alert('No problem loaded');
      return;
    }
    
    setIsTesting(true);
    try {
      const response = await codeExecutionAPI.testCode(
        sessionData.problem.id,
        code,
        language
      );
      
      setResults({
        type: 'test',
        ...response.data
      });
      setShowResults(true);
    } catch (error) {
      console.error('Test error:', error);
      setResults({
        type: 'test',
        status: 'ERROR',
        message: 'Test failed: ' + error.message,
        passedTestCases: 0,
        totalTestCases: 0
      });
      setShowResults(true);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Handler for End Session button (host only)
  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end the session? This will close the room for all members.')) {
      setLoading(true);
      const result = await endSession();
      
      if (result.success) {
        // Navigate to home after successful end
        console.log('Room ended successfully, navigating home...');
        onBackToHome(); // Use the prop callback
      } else {
        alert('Failed to end session: ' + result.message);
        setLoading(false);
      }
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-purple-300">Loading session...</div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-400 font-semibold mb-2">Session Loading Failed</div>
          <div className="text-red-300 mb-4">{error}</div>
          <button
            onClick={onBackToLobby}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }
  
  // No problem state
  if (!sessionData?.problem) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-yellow-400 font-semibold mb-2">No Problem Selected</div>
          <div className="text-yellow-300 mb-4">Waiting for host to select a problem...</div>
          <button
            onClick={onBackToLobby}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }
  
  // Determine current host from the most recent room data
  // Use the members list to find who is currently the HOST, not cached hostUsername
  const isHost = sessionData?.members?.find(m => m.role === 'HOST')?.username === user?.username;
  const problem = sessionData.problem;
  
  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{sessionData.roomName}</h1>
              <div className="flex items-center space-x-4 text-purple-300">
                <span className="flex items-center space-x-2">
                  <span>{sessionData.mode === 'PRACTICE' ? '🎯' : '⚔️'}</span>
                  <span>{sessionData.mode === 'PRACTICE' ? 'Practice' : 'Tournament'}</span>
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  ACTIVE
                </span>
              </div>
            </div>
            
            {/* Timer */}
            {remainingTime !== null && remainingTime !== undefined && sessionData.timeLimit > 0 && (
              <div className="bg-slate-700/50 px-4 py-3 rounded-xl border border-purple-500/20">
                <div className="text-center">
                  <div className="text-sm text-purple-300">Time Remaining</div>
                  <div className={`text-2xl font-bold ${remainingTime < 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition-colors"
            >
              {showProblem ? 'Hide Problem' : 'Show Problem'}
            </button>
            
            {/* Leave Room - always visible for everyone including host */}
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to leave the room?')) {
                  await leaveRoom();
                  onBackToHome();
                }
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl"
            >
              Leave Room
            </button>
            
            {/* Host-only buttons */}
            {isHost && (
              <>
                <button
                  onClick={handleEndSession}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Ending...' : 'End Session'}
                </button>
                <button
                  onClick={onBackToLobby}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Back to Lobby
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Members Status */}
        {sessionData.members && sessionData.members.length > 0 && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-purple-300 text-sm">Members:</span>
            {sessionData.members.map((member) => (
              <div
                key={member.username}
                className="flex items-center space-x-2 bg-slate-700/30 px-3 py-1 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {member.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white text-sm">{member.username}</span>
                {member.role === 'HOST' && <span className="text-yellow-400">👑</span>}
                <span className="text-green-400 text-xs">●</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Main Workspace - rest remains the same */}
      <div className={`grid gap-8 ${showProblem ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Problem Display */}
        {showProblem && (
          <div className="space-y-6">
            <ProblemDetail
              problem={problem}
              onBack={() => setShowProblem(false)}
            />
          </div>
        )}
        
        {/* Code Editor */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Your Solution</h3>
              <div className="text-sm text-purple-300">
                Problem: {problem.title}
              </div>
            </div>
            <CodeEditor
              language="cpp"
              onCodeChange={handleCodeChange}
              onSubmit={handleCodeSubmit}
              onTest={handleCodeTest}
              isSubmitting={isSubmitting}
              isTesting={isTesting}
            />
          </div>
          
          {/* Session Mode Info */}
          <div className={`rounded-xl p-4 border ${sessionData.mode === 'PRACTICE'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {sessionData.mode === 'PRACTICE' ? '🎯' : '⚔️'}
              </span>
              <div>
                <h4 className={`font-bold ${sessionData.mode === 'PRACTICE' ? 'text-green-400' : 'text-orange-400'}`}>
                  {sessionData.mode === 'PRACTICE' ? 'Practice Mode' : 'Tournament Mode'}
                </h4>
                <p className="text-sm text-gray-300">
                  {sessionData.mode === 'PRACTICE'
                    ? 'Collaborate, discuss, and learn together! No time pressure.'
                    : 'Race against time and other members! First correct solution wins.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={results}
      />
    </div>
  );
};

export default ActiveSessionWorkspace;
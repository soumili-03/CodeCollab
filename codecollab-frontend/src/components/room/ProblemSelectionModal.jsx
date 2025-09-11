// src/components/room/ProblemSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { problemAPI } from '../../services/api';

const ProblemSelectionModal = ({ isOpen, onClose, onSelectProblem, roomMode }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [difficulty, setDifficulty] = useState('ALL');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      fetchProblems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, difficulty, category]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      let response;
      
      if (difficulty !== 'ALL') {
        response = await problemAPI.getProblemsByDifficulty(difficulty);
      } else if (category !== 'ALL') {
        response = await problemAPI.getProblemsByCategory(category);
      } else {
        response = await problemAPI.getAllProblems();
      }
      
      setProblems(response.data);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = () => {
    if (!selectedProblem) return;
    
    onSelectProblem(selectedProblem.id, roomMode === 'TOURNAMENT' ? timeLimit : null);
    onClose();
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'EASY': 
        return { color: 'text-green-400 bg-green-400/10 border-green-400/30', icon: '🟢' };
      case 'MEDIUM': 
        return { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: '🟡' };
      case 'HARD': 
        return { color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: '🔴' };
      default: 
        return { color: 'text-gray-400 bg-gray-400/10 border-gray-400/30', icon: '⚪' };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ARRAYS': return '📊';
      case 'STRINGS': return '🔤';
      default: return '💻';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-800/95 backdrop-blur-md border border-purple-500/20 rounded-2xl max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🎯 Select Problem</h2>
              <p className="text-purple-300">Choose a problem for your coding session</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-slate-700/50 border border-purple-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">🟢 Easy</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HARD">🔴 Hard</option>
              </select>
            </div>
            
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-700/50 border border-purple-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Categories</option>
                <option value="ARRAYS">📊 Arrays</option>
                <option value="STRINGS">🔤 Strings</option>
              </select>
            </div>

            {/* Time limit for tournament mode */}
            {roomMode === 'TOURNAMENT' && (
              <div className="flex items-center space-x-2">
                <label className="text-purple-300 text-sm">⏱️ Time Limit:</label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="bg-slate-700/50 border border-purple-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Problem List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-300">Loading problems...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {problems.map((problem) => {
                const difficultyConfig = getDifficultyConfig(problem.difficulty);
                const isSelected = selectedProblem?.id === problem.id;
                
                return (
                  <div
                    key={problem.id}
                    onClick={() => setSelectedProblem(problem)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                        : 'border-purple-500/20 bg-slate-700/30 hover:border-purple-400/40 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{problem.title}</h3>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border ${difficultyConfig.color}`}>
                            <span className="mr-1">{difficultyConfig.icon}</span>
                            {problem.difficulty}
                          </span>
                          
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium text-blue-400 bg-blue-400/10 border border-blue-400/30">
                            <span className="mr-1">{getCategoryIcon(problem.category)}</span>
                            {problem.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {problem.description.substring(0, 150)}...
                        </p>
                        
                        <div className="mt-2 flex items-center space-x-4 text-xs text-purple-300">
                          <span>⏱️ {problem.timeLimitMs}ms</span>
                          <span>💾 {problem.memoryLimitMb}MB</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="ml-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/50 p-6 border-t border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="text-purple-300 text-sm">
              {selectedProblem ? (
                <span>✅ Selected: <strong>{selectedProblem.title}</strong></span>
              ) : (
                <span>👆 Select a problem to start the session</span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSelectProblem}
                disabled={!selectedProblem}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Start Session</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSelectionModal;
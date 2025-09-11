// src/components/problem/ProblemList.jsx - Engaging Problem Browser
import React, { useState, useEffect } from 'react';
import { problemAPI } from '../../services/api';

const ProblemList = ({ onProblemSelect }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchProblems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty, selectedCategory]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedDifficulty !== 'ALL') {
        response = await problemAPI.getProblemsByDifficulty(selectedDifficulty);
      } else if (selectedCategory !== 'ALL') {
        response = await problemAPI.getProblemsByCategory(selectedCategory);
      } else {
        response = await problemAPI.getAllProblems();
      }

      setProblems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'EASY': 
        return { 
          color: 'text-green-400 bg-green-400/10 border-green-400/30', 
          icon: '🟢',
          gradient: 'from-green-400/20 to-emerald-400/20'
        };
      case 'MEDIUM': 
        return { 
          color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', 
          icon: '🟡',
          gradient: 'from-yellow-400/20 to-orange-400/20'
        };
      case 'HARD': 
        return { 
          color: 'text-red-400 bg-red-400/10 border-red-400/30', 
          icon: '🔴',
          gradient: 'from-red-400/20 to-pink-400/20'
        };
      default: 
        return { 
          color: 'text-gray-400 bg-gray-400/10 border-gray-400/30', 
          icon: '⚪',
          gradient: 'from-gray-400/20 to-slate-400/20'
        };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ARRAYS': return '📊';
      case 'STRINGS': return '🔤';
      case 'DYNAMIC_PROGRAMMING': return '🧠';
      case 'GRAPHS': return '🕸️';
      default: return '💻';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-pulse">💻</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">😵</div>
          <div className="text-red-400 font-semibold mb-2">Oops! Something went wrong</div>
          <div className="text-red-300">{error}</div>
          <button 
            onClick={fetchProblems}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-slate-800/30 border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
      {/* Filters Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-purple-500/20">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-3">🎯</span>
          Choose Your Challenge
        </h3>
        
        <div className="flex flex-wrap gap-4">
          {/* Difficulty Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-300">
              🏆 Difficulty Level
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-700/50 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
            >
              <option value="ALL">All Levels</option>
              <option value="EASY">🟢 Easy</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HARD">🔴 Hard</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-300">
              📚 Problem Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-700/50 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="ARRAYS">📊 Arrays</option>
              <option value="STRINGS">🔤 Strings</option>
              <option value="DYNAMIC_PROGRAMMING">🧠 Dynamic Programming</option>
              <option value="GRAPHS">🕸️ Graphs</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <span className="text-purple-300">
            Found <span className="text-yellow-400 font-bold">{problems.length}</span> problems
          </span>
          {selectedDifficulty !== 'ALL' && (
            <span className="text-purple-300">
              Filtered by <span className="text-blue-400 font-semibold">{selectedDifficulty}</span> difficulty
            </span>
          )}
        </div>
      </div>

      {/* Problems Grid */}
      <div className="p-6">
        {problems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl text-gray-400 mb-2">No problems found</div>
            <div className="text-purple-300">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((problem, index) => {
              const difficultyConfig = getDifficultyConfig(problem.difficulty);
              return (
                <div
                  key={problem.id}
                  onClick={() => onProblemSelect(problem)}
                  className={`group relative overflow-hidden bg-gradient-to-r ${difficultyConfig.gradient} backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-purple-400/40 transform hover:-translate-y-1`}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Problem Title & Tags */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                            #{index + 1} {problem.title}
                          </h3>
                          
                          {/* Difficulty Badge */}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${difficultyConfig.color} transition-all group-hover:scale-105`}>
                            <span className="mr-1">{difficultyConfig.icon}</span>
                            {problem.difficulty}
                          </span>
                          
                          {/* Category Badge */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-400 bg-blue-400/10 border border-blue-400/30 transition-all group-hover:scale-105">
                            <span className="mr-1">{getCategoryIcon(problem.category)}</span>
                            {problem.category}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 leading-relaxed mb-4 group-hover:text-gray-200 transition-colors">
                          {problem.description}
                        </p>

                        {/* Problem Stats */}
                        <div className="flex items-center space-x-6 text-sm text-purple-300">
                          <div className="flex items-center space-x-1">
                            <span>⏱️</span>
                            <span>Time: {problem.timeLimitMs}ms</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💾</span>
                            <span>Memory: {problem.memoryLimitMb}MB</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>👤</span>
                            <span>Solved by 156 users</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Arrow */}
                      <div className="ml-6 flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center group-hover:from-purple-500 group-hover:to-blue-500 transition-all transform group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                          <span className="text-white text-xl">→</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemList;
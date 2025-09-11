// src/components/problem/ProblemDetail.jsx - Beautiful Problem Display
import React from 'react';

const ProblemDetail = ({ problem, onBack }) => {
  if (!problem) {
    return (
      <div className="backdrop-blur-md bg-slate-800/30 border border-purple-500/20 rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-xl text-purple-300">Select a problem to start coding</p>
      </div>
    );
  }

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'EASY': 
        return { 
          color: 'text-green-400 bg-green-400/10 border-green-400/30', 
          icon: '🟢',
          bgGradient: 'from-green-400/10 to-emerald-400/10'
        };
      case 'MEDIUM': 
        return { 
          color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', 
          icon: '🟡',
          bgGradient: 'from-yellow-400/10 to-orange-400/10'
        };
      case 'HARD': 
        return { 
          color: 'text-red-400 bg-red-400/10 border-red-400/30', 
          icon: '🔴',
          bgGradient: 'from-red-400/10 to-pink-400/10'
        };
      default: 
        return { 
          color: 'text-gray-400 bg-gray-400/10 border-gray-400/30', 
          icon: '⚪',
          bgGradient: 'from-gray-400/10 to-slate-400/10'
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

  const difficultyConfig = getDifficultyConfig(problem.difficulty);

  return (
    <div className="backdrop-blur-md bg-slate-800/30 border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${difficultyConfig.bgGradient} p-6 border-b border-purple-500/20`}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="group flex items-center space-x-2 text-purple-300 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-xl group-hover:animate-bounce">←</span>
            <span className="font-medium">Back to Problems</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {/* Difficulty Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-xl border backdrop-blur-sm ${difficultyConfig.color} transition-all hover:scale-105`}>
              <span className="mr-2 text-lg">{difficultyConfig.icon}</span>
              <span className="font-bold">{problem.difficulty}</span>
            </div>
            
            {/* Category Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-xl border text-blue-400 bg-blue-400/10 border-blue-400/30 backdrop-blur-sm transition-all hover:scale-105">
              <span className="mr-2 text-lg">{getCategoryIcon(problem.category)}</span>
              <span className="font-bold">{problem.category}</span>
            </div>
          </div>
        </div>
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {problem.title}
          </h1>
          
          <div className="flex items-center justify-center space-x-8 text-purple-300">
            <div className="flex items-center space-x-2">
              <span>⏱️</span>
              <span>Time Limit: <span className="text-yellow-400 font-bold">{problem.timeLimitMs}ms</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💾</span>
              <span>Memory Limit: <span className="text-blue-400 font-bold">{problem.memoryLimitMb}MB</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3">📖</span>
            Problem Description
          </h2>
          <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <p className="text-gray-200 leading-relaxed text-lg">
              {problem.description}
            </p>
          </div>
        </div>

        {/* Input Format */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3">📥</span>
            Input Format
          </h2>
          <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <pre className="text-green-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {problem.inputFormat}
            </pre>
          </div>
        </div>

        {/* Output Format */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3">📤</span>
            Output Format
          </h2>
          <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
            <pre className="text-blue-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {problem.outputFormat}
            </pre>
          </div>
        </div>

        {/* Constraints */}
        {problem.constraints && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">⚖️</span>
              Constraints
            </h2>
            <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10">
              <pre className="text-orange-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {problem.constraints}
              </pre>
            </div>
          </div>
        )}

        {/* Sample Input/Output */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3">🧪</span>
            Sample Test Case
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sample Input */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-green-400 flex items-center">
                <span className="mr-2">📥</span>
                Sample Input
              </h3>
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/30">
                <pre className="text-green-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
{problem.sampleInput}
                </pre>
              </div>
            </div>
            
            {/* Sample Output */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-blue-400 flex items-center">
                <span className="mr-2">📤</span>
                Sample Output
              </h3>
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-500/30">
                <pre className="text-blue-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
{problem.sampleOutput}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {problem.explanation && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">💡</span>
              Explanation
            </h2>
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-400/20">
              <p className="text-purple-200 leading-relaxed text-lg">
                {problem.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
          <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Pro Tips
          </h3>
          <ul className="space-y-2 text-yellow-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Read the problem statement carefully and understand the input/output format</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Test your solution with the sample input before submitting</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Consider edge cases and boundary conditions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Optimize for time and space complexity if needed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
// src/components/common/ResultsModal.jsx - Engaging Results Display
import React from 'react';

const ResultsModal = ({ isOpen, onClose, results }) => {
  if (!isOpen || !results) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'AC': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'WA': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'ERROR': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AC': return '🎉';
      case 'WA': return '❌';
      case 'ERROR': return '⚠️';
      default: return '🤔';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AC': return 'Accepted';
      case 'WA': return 'Wrong Answer';
      case 'ERROR': return 'Error';
      default: return status;
    }
  };

  const isSuccess = results.status === 'AC';
  const passPercentage = results.totalTestCases > 0 ? 
    Math.round((results.passedTestCases / results.totalTestCases) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800/90 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Success Animation */}
        {isSuccess && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            {getStatusIcon(results.status)}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${getStatusColor(results.status)}`}>
            {getStatusText(results.status)}
          </h3>
          <p className="text-purple-300">
            {results.type === 'test' ? 'Sample Test Results' : 'Final Submission Results'}
          </p>
        </div>

        {/* Results Stats */}
        <div className="space-y-6 mb-8">
          {/* Test Cases Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Test Cases Passed</span>
              <span className="text-white font-bold">
                {results.passedTestCases} / {results.totalTestCases}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  isSuccess ? 'bg-gradient-to-r from-green-400 to-blue-500' : 
                  passPercentage > 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-red-400 to-pink-500'
                }`}
                style={{ width: `${passPercentage}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className={`text-2xl font-bold ${
                isSuccess ? 'text-green-400' : 
                passPercentage > 0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {passPercentage}%
              </span>
            </div>
          </div>

          {/* Execution Time */}
          {results.executionTimeMs && (
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-gray-300 flex items-center">
                <span className="mr-2">⚡</span>
                Execution Time
              </span>
              <span className="text-blue-400 font-mono">
                {results.executionTimeMs}ms
              </span>
            </div>
          )}

          {/* Message */}
          <div className={`p-4 rounded-lg border ${getStatusColor(results.status)}`}>
            <p className="text-center font-medium">
              {results.message}
            </p>
          </div>

          {/* Test Case Results */}
          {results.testCaseResults && results.testCaseResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white mb-3">Test Case Details</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {results.testCaseResults.map((testCase, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      testCase.passed ? 
                      'bg-green-400/5 border-green-400/20' : 
                      'bg-red-400/5 border-red-400/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        Test Case {index + 1}
                      </span>
                      <span className={`font-bold ${
                        testCase.passed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {testCase.passed ? '✅ PASS' : '❌ FAIL'}
                      </span>
                    </div>
                    {!testCase.passed && testCase.error && (
                      <p className="text-red-300 text-sm mt-1">
                        {testCase.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSuccess ? '🎉 Awesome!' : '💪 Try Again'}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
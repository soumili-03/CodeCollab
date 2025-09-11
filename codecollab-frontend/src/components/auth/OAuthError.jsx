// src/components/auth/OAuthError.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorMessage = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="text-3xl font-bold text-white mb-4">Authentication Failed</h2>
        <p className="text-red-400 text-lg mb-2">Oops! Something went wrong</p>
        <p className="text-purple-300 mb-8">{errorMessage}</p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🏠</span>
              <span>Back to Home</span>
            </span>
          </button>
          
          <button
            onClick={() => window.location.href = 'http://localhost:8083/oauth2/authorization/google'}
            className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Try Google Sign-in Again</span>
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>If the problem persists, please try signing up with email instead.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthError;
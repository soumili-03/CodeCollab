// src/components/auth/OAuthSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromOAuth } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const username = searchParams.get('user');

        if (!token || !username) {
          setError('Missing authentication data');
          setTimeout(() => navigate('/auth/error'), 2000);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Fetch full user data using the token
        const response = await fetch('http://localhost:8083/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserFromOAuth(userData);
          
          // Success - redirect to main app after short delay
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('OAuth success processing error:', error);
        setError('Authentication processing failed');
        setTimeout(() => navigate('/auth/error'), 2000);
      } finally {
        setProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, setUserFromOAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-purple-300">Redirecting to error page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
        <div className="text-white text-2xl font-bold mb-2">Welcome to CodeCollab! 🎉</div>
        <div className="text-green-400 text-lg mb-4">Google Sign-in Successful</div>
        <div className="text-purple-300">Setting up your account...</div>
        
        {/* Progress bar */}
        <div className="w-64 bg-slate-700 rounded-full h-2 mx-auto mt-6">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
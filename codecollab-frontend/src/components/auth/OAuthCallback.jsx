//src/components/auth/OAuthCallback.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const { setUserFromOAuth } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const username = urlParams.get('username');
    const email = urlParams.get('email');
    const userId = urlParams.get('userId');

    if (token && username && email) {
      // Store token and user info
      localStorage.setItem('token', token);
      
      const user = {
        id: userId,
        username: username,
        email: email,
        rating: 1200 // Default rating
      };

      setUserFromOAuth(user);
      
      // Redirect to main app
      window.location.href = '/';
    } else {
      // Handle error
      console.error('OAuth callback missing required parameters');
      window.location.href = '/auth/error';
    }
  }, [setUserFromOAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
        <div className="text-white text-xl mb-2">Completing Google Sign-in...</div>
        <div className="text-purple-300">Please wait while we log you in</div>
      </div>
    </div>
  );
};

export default OAuthCallback;

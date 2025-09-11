// src/App.js - Updated with RoomProvider
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppContent from './AppContent';
import OAuthSuccess from './components/auth/OAuthSuccess';
import OAuthError from './components/auth/OAuthError';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="/auth/success" element={<OAuthSuccess />} />
              <Route path="/auth/error" element={<OAuthError />} />
            </Routes>
          </div>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
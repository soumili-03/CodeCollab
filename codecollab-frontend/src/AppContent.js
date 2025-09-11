// src/AppContent.js - Updated with Room Functionality
import React, { useState } from 'react';
import ProblemList from './components/problem/ProblemList';
import ProblemDetail from './components/problem/ProblemDetail';
import CodeEditor from './components/editor/CodeEditor';
import ResultsModal from './components/common/ResultsModal';
import AuthModal from './components/auth/AuthModal';
import CreateRoomModal from './components/room/CreateRoomModal';
import JoinRoomModal from './components/room/JoinRoomModal';
import RoomLobby from './components/room/RoomLobby';
import ActiveSessionWorkspace from './components/room/ActiveSessionWorkspace';
import { useAuth } from './context/AuthContext';
import { useRoom } from './context/RoomContext';
import { codeExecutionAPI } from './services/api';
import './App.css';

// App Content Component with Auth and Room Logic
function AppContent() {
    const { user, logout, isAuthenticated, loading } = useAuth();
    const { currentRoom, isInRoom, endSession } = useRoom();
    
    // View states
    const [currentView, setCurrentView] = useState('problems'); // 'problems', 'solve', 'room-lobby', 'room-active'
    const [selectedProblem, setSelectedProblem] = useState(null);
    

    // Add code state
    const [code, setCode] = useState('');

    // Code execution states - remove unused 'code' variable
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);

    // Modal states
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
    const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    // Auto-redirect to room if user is in a room
    React.useEffect(() => {
        if (isInRoom && currentRoom && currentView === 'problems') {
            setCurrentView('room-lobby');
        }
    }, [isInRoom, currentRoom, currentView]);

    // Auth Handlers
    const handleLogin = () => {
        setAuthMode('login');
        setShowAuthModal(true);
    };

    const handleRegister = () => {
        setAuthMode('register');
        setShowAuthModal(true);
    };

    const handleLogout = () => {
        logout();
        setCurrentView('problems');
        setSelectedProblem(null);
    };

    // Room Handlers
    const handleCreateRoom = () => {
        if (!isAuthenticated) {
            handleLogin();
            return;
        }
        setShowCreateRoomModal(true);
    };

    const handleJoinRoom = () => {
        if (!isAuthenticated) {
            handleLogin();
            return;
        }
        setShowJoinRoomModal(true);
    };

    const handleRoomCreated = (room) => {
        setCurrentView('room-lobby');
    };

    const handleRoomJoined = (room) => {
        setCurrentView('room-lobby');
    };

    const handleStartSession = (sessionData) => {
        console.log('🚀 Session started with data:', sessionData);
        // Transition to active session view
        setCurrentView('room-active');
    };

    const handleBackToHome = () => {
        setCurrentView('problems');
        setSelectedProblem(null);
    };

    // Existing handlers
    const handleProblemSelect = (problem) => {
        if (isInRoom) {
            alert('You cannot solve individual problems while in a room. Leave the room first.');
            return;
        }
        setSelectedProblem(problem);
        setCurrentView('solve');
    };

    const handleBackToProblems = () => {
        setCurrentView('problems');
        setSelectedProblem(null);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    // Define handleEndSession using endSession from context
    const handleEndSession = () => {
        endSession();             // call RoomContext to end session
        setCurrentView('room-lobby'); // back to lobby
    };

    const handleCodeSubmit = async (code, language) => {
        if (!selectedProblem) return;

        setIsSubmitting(true);
        try {
            const response = await codeExecutionAPI.submitCode(selectedProblem.id, code, language);
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
        if (!selectedProblem) return;

        setIsTesting(true);
        try {
            const response = await codeExecutionAPI.testCode(selectedProblem.id, code, language);
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

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <div className="text-purple-300">Loading CodeCollab...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -inset-10 opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-xl opacity-70 animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-xl opacity-50 animate-pulse animation-delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full filter blur-xl opacity-60 animate-pulse animation-delay-2000"></div>
                </div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[10000] bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <span className="text-black font-bold text-xl">C</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                        CodeCollab
                                    </h1>
                                    <p className="text-purple-300 text-sm">Code • Compete • Conquer</p>
                                </div>
                            </div>
                            
                            {/* View indicator */}
                            {selectedProblem && (
                                <div className="ml-8 flex items-center space-x-2">
                                    <span className="text-gray-400">/</span>
                                    <span className="text-yellow-400 font-semibold">{selectedProblem.title}</span>
                                </div>
                            )}
                            {isInRoom && currentRoom && (
                                <div className="ml-8 flex items-center space-x-2">
                                    <span className="text-gray-400">/</span>
                                    <span className="text-green-400 font-semibold">Room: {currentRoom.roomCode}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-purple-500/20">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">
                                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-white font-medium text-sm">{user?.username}</div>
                                                <div className="text-purple-300 text-xs">Rating: {user?.rating || 1200}</div>
                                            </div>
                                        </div>

                                        {/* Room Action Buttons - Only show if not in a room or in lobby */}
                                        {!isInRoom && (
                                            <>
                                                <button
                                                    onClick={handleCreateRoom}
                                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                                >
                                                    <span className="flex items-center space-x-2">
                                                        <span>🚀</span>
                                                        <span>Create Room</span>
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={handleJoinRoom}
                                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                                >
                                                    <span className="flex items-center space-x-2">
                                                        <span>⚡</span>
                                                        <span>Join Room</span>
                                                    </span>
                                                </button>
                                            </>
                                        )}

                                        {/* Back to Home button - Show if in room or solving problem */}
                                        {(isInRoom || selectedProblem) && (
                                            <button
                                                onClick={handleBackToHome}
                                                className="px-4 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-purple-300 hover:text-purple-200 border border-slate-500/50 hover:border-slate-400/50 font-semibold rounded-xl transition-all duration-300"
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <span>🏠</span>
                                                    <span className="hidden sm:inline">Home</span>
                                                </span>
                                            </button>
                                        )}

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 font-semibold rounded-xl transition-all duration-300"
                                            title="Logout"
                                        >
                                            <span className="flex items-center space-x-2">
                                                <span>🚪</span>
                                                <span className="hidden sm:inline">Logout</span>
                                            </span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Login/Register Buttons */}
                                    <button
                                        onClick={handleLogin}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <span>🔐</span>
                                            <span>Login</span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleRegister}
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <span>⚡</span>
                                            <span>Sign Up</span>
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-28">
                {currentView === 'room-lobby' && isInRoom && (
                    <RoomLobby
                        onStartSession={handleStartSession}
                        onBackToHome={handleBackToHome}
                    />
                )}

                {currentView === 'room-active' && isInRoom && (
                    <ActiveSessionWorkspace
                        onEndSession={handleEndSession}
                        onBackToLobby={() => setCurrentView('room-lobby')}
                        onBackToHome={handleBackToHome}
                    />
                )}

                {currentView === 'problems' && !isInRoom && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-bold text-white mb-4">
                                {isAuthenticated ? `Welcome back, ${user?.username}!` : 'Challenge Yourself'}
                            </h2>
                            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
                                {isAuthenticated
                                    ? 'Continue your coding journey and level up your skills'
                                    : 'Master coding challenges, compete with friends, and level up your programming skills'
                                }
                            </p>

                            {/* User Stats - Only show if authenticated */}
                            {isAuthenticated && (
                                <div className="mt-8 flex justify-center space-x-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-yellow-400">2</div>
                                        <div className="text-purple-300">Problems Solved</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-400">100%</div>
                                        <div className="text-purple-300">Success Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-400">{user?.rating || 1200}</div>
                                        <div className="text-purple-300">Rating Points</div>
                                    </div>
                                </div>
                            )}

                            {/* Call to Action for Non-Authenticated Users */}
                            {!isAuthenticated && (
                                <div className="mt-8 space-y-4">
                                    <div className="text-purple-300 mb-6">
                                        Join thousands of developers improving their coding skills
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={handleRegister}
                                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            <span className="flex items-center space-x-2">
                                                <span>🚀</span>
                                                <span>Start Coding Now</span>
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleLogin}
                                            className="px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border border-purple-500/30"
                                        >
                                            <span className="flex items-center space-x-2">
                                                <span>🔐</span>
                                                <span>Already have an account?</span>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Room Quick Actions for Authenticated Users */}
                            {isAuthenticated && (
                                <div className="mt-8 space-y-4">
                                    <div className="text-purple-300 mb-6">
                                        Ready to collaborate? Create or join a room to code with friends!
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={handleCreateRoom}
                                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            <span className="flex items-center space-x-2">
                                                <span>🚀</span>
                                                <span>Create Room</span>
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleJoinRoom}
                                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            <span className="flex items-center space-x-2">
                                                <span>⚡</span>
                                                <span>Join Room</span>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <ProblemList onProblemSelect={handleProblemSelect} />
                    </div>
                )}

                {currentView === 'solve' && selectedProblem && !isInRoom && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Problem Details */}
                        <div className="space-y-6">
                            <ProblemDetail
                                problem={selectedProblem}
                                onBack={handleBackToProblems}
                            />
                        </div>

                        {/* Code Editor */}
                        <div className="space-y-6">
                            <CodeEditor
                                language="cpp"
                                onCodeChange={handleCodeChange}
                                onSubmit={isAuthenticated ? handleCodeSubmit : () => {
                                    setShowAuthModal(true);
                                    setAuthMode('login');
                                }}
                                onTest={isAuthenticated ? handleCodeTest : () => {
                                    setShowAuthModal(true);
                                    setAuthMode('login');
                                }}
                                isSubmitting={isSubmitting}
                                isTesting={isTesting}
                            />

                            {/* Authentication Prompt for Code Actions */}
                            {!isAuthenticated && (
                                <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            🔒 Authentication Required
                                        </h3>
                                        <p className="text-purple-300 mb-4">
                                            Please sign in to test and submit your code solutions
                                        </p>
                                        <div className="flex justify-center space-x-3">
                                            <button
                                                onClick={handleLogin}
                                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                                            >
                                                Sign In
                                            </button>
                                            <button
                                                onClick={handleRegister}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                                            >
                                                Create Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Room blocking message for individual problem solving */}
                {currentView === 'solve' && isInRoom && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🚫</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Cannot Solve Individual Problems</h2>
                        <p className="text-purple-300 mb-6">
                            You are currently in a room. Leave the room first to solve problems individually.
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => setCurrentView('room-lobby')}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                            >
                                Back to Room
                            </button>
                            <button
                                onClick={handleBackToHome}
                                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg"
                            >
                                Home
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authMode}
            />

            <CreateRoomModal
                isOpen={showCreateRoomModal}
                onClose={() => setShowCreateRoomModal(false)}
                onSuccess={handleRoomCreated}
            />

            <JoinRoomModal
                isOpen={showJoinRoomModal}
                onClose={() => setShowJoinRoomModal(false)}
                onSuccess={handleRoomJoined}
            />

            <ResultsModal
                isOpen={showResults}
                onClose={() => setShowResults(false)}
                results={results}
            />
        </>
    );
}

export default AppContent;
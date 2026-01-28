import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

function Header({ isListening, setIsListening, onTranscript }) {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const [user, setUser] = useState(null);

  // Settings state - Load from localStorage
  // Language is always English (US) - no need for state
  const language = 'en-US';
  
  const [autoSave, setAutoSave] = useState(() => {
    return localStorage.getItem('livetruth_autoSave') !== 'false';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('livetruth_darkMode') !== 'false';
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('livetruth_notifications') !== 'false';
  });

  // Set language to English (US) always
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('livetruth_autoSave', autoSave.toString());
  }, [autoSave]);

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    localStorage.setItem('livetruth_darkMode', darkMode.toString());
    // Apply dark mode to document and body
    // Apply dark mode to document and body
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.background = '#000000'; // Pure Black for dark mode
      document.body.style.color = '#f3f4f6';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.background = '#1a1f2e'; // Bluish for light mode
      document.body.style.color = '#f3f4f6'; // Keep text light even in "light" mode as bg is dark
    }
  }, [darkMode]);
  
  // Apply initial dark mode on mount (before darkMode state is set)
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('livetruth_darkMode') !== 'false';
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.background = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.background = '#1a1f2e';
    }
  }, []);
  
  // Apply initial dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.body.style.background = '#000000';
    } else {
      document.body.style.background = '#1a1f2e';
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('livetruth_notifications', notifications.toString());
    // Request notification permission if enabled
    if (notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notifications]);

  // Check for logged in user
  useEffect(() => {
    const savedUser = localStorage.getItem('livetruth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [showProfile]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setStatus('unsupported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setStatus('listening');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onTranscript(interimTranscript, false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatus('error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setStatus('stopped');
      setIsListening(false);
      if (isListening) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, setIsListening, onTranscript, language]);

  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when listening state changes
  useEffect(() => {
    setIsProcessing(false);
  }, [isListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      setIsProcessing(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setStatus('error');
        setIsProcessing(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening && !isProcessing) {
      setIsProcessing(true);
      recognitionRef.current.stop();
      setIsListening(false);
      // Processing state will be reset by the useEffect above
    }
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 px-4 md:px-6 py-3 relative z-50">
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        {/* Modern Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          {/* Animated Logo Icon */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            
            {/* Logo container */}
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25">
              {/* Sound wave icon */}
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 3v18M8 8v8M16 6v12M4 11v2M20 9v6" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
              
              {/* Checkmark overlay */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Brand Name */}
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              LiveTruth
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase hidden sm:block">
              Real-Time Fact Checker
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Listen Button */}
          {!isListening ? (
            <button
              onClick={startListening}
              disabled={isProcessing}
              className={`relative flex items-center gap-2 px-4 md:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 text-sm md:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] ${
                isProcessing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isProcessing ? 'Starting...' : 'Start Listening'}</span>
              <span className="sm:hidden">{isProcessing ? '...' : 'Start'}</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              disabled={isProcessing}
              className={`relative flex items-center gap-2 px-4 md:px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 text-sm md:text-base shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] ${
                isProcessing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {/* Pulsing indicator - hide when processing */}
              {!isProcessing && (
                <span className="absolute -top-1 -right-1 w-3 h-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
              {isProcessing ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              )}
              <span className="hidden sm:inline">{isProcessing ? 'Stopping...' : 'Stop Listening'}</span>
              <span className="sm:hidden">{isProcessing ? '...' : 'Stop'}</span>
            </button>
          )}

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                setShowProfile(false);
              }}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                showSettings 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300" style={{ transform: showSettings ? 'rotate(45deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Settings Dropdown Menu */}
            {showSettings && (
              <div
              className="absolute right-0 top-full mt-2 w-72 border border-gray-700 rounded-xl shadow-2xl shadow-black/80 py-2 z-[9999] animate-fadeIn"
              style={{
                backgroundColor: '#1a1f2e',
                opacity: 1,
                isolation: 'isolate'
              }}
            >            
                <div className="px-4 py-2 border-b border-gray-700" style={{ backgroundColor: '#1a1f2e', opacity: 1 }}>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Settings
                  </h3>
                </div>

                {/* Language Display (Always English US) */}
                <div className="px-4 py-3" style={{ backgroundColor: '#1a1f2e', opacity: 1 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span className="text-gray-300 text-sm">Language</span>
                    </div>
                    <span className="text-gray-400 text-sm">English (US)</span>
                  </div>
                </div>

                {/* Auto-Save Toggle */}
                <div className="px-4 py-3 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setAutoSave(!autoSave); }} style={{ backgroundColor: '#1a1f2e', opacity: 1 }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span className="text-gray-300 text-sm">Auto-save Sessions</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${autoSave ? 'bg-blue-600' : 'bg-gray-600'} relative`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autoSave ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                </div>

                {/* Notifications Toggle */}
                <div className="px-4 py-3 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }} style={{ backgroundColor: '#1a1f2e', opacity: 1 }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="text-gray-300 text-sm">Notifications</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${notifications ? 'bg-blue-600' : 'bg-gray-600'} relative`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${notifications ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="px-4 py-3 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }} style={{ backgroundColor: '#1a1f2e', opacity: 1 }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="text-gray-300 text-sm">Dark Mode</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-600'} relative`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${darkMode ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 mt-2 pt-2" style={{ backgroundColor: '#1a1f2e', opacity: 1 }}>
                  <button 
                    onClick={() => { setShowSettings(false); navigate('/about'); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                    style={{ backgroundColor: '#1a1f2e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About LiveTruth
                  </button>
                  <button 
                    onClick={() => { setShowSettings(false); navigate('/help'); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                    style={{ backgroundColor: '#1a1f2e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => {
                setShowProfile(!showProfile);
                setShowSettings(false);
              }}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                showProfile 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div
              className="absolute right-0 top-full mt-2 w-72 border border-gray-700 rounded-xl shadow-2xl shadow-black/80 py-2 z-[9999] animate-fadeIn"
              style={{
                backgroundColor: '#1a1f2e',
                opacity: 1,
                isolation: 'isolate'
              }}
            >            
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-700" style={{ backgroundColor: '#1a1f2e', opacity: 1 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user ? user.name?.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user ? user.name : 'Guest User'}</p>
                      <p className="text-gray-400 text-sm">{user ? user.email : 'guest@livetruth.app'}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2" style={{ backgroundColor: '#1a1f2e', opacity: 1 }}>
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/profile'); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                    style={{ backgroundColor: '#1a1f2e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/sessions'); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                    style={{ backgroundColor: '#1a1f2e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    My Sessions
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/analytics'); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                    style={{ backgroundColor: '#1a1f2e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/export'); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                    style={{ backgroundColor: '#1a1f2e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Report
                  </button>
                </div>

                <div className="border-t border-gray-700 pt-2" style={{ backgroundColor: '#1a1f2e', opacity: 1 }}>
                  {user ? (
                    <button 
                      onClick={() => { 
                        localStorage.removeItem('livetruth_user');
                        localStorage.removeItem('livetruth_token');
                        setUser(null);
                        setShowProfile(false);
                        // Redirect to auth page after sign out
                        navigate('/auth');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 transition-colors flex items-center gap-3"
                      style={{ backgroundColor: '#1a1f2e' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setShowProfile(false); navigate('/auth'); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 transition-colors flex items-center gap-3"
                      style={{ backgroundColor: '#1a1f2e' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1f2e'}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In / Register
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

export default Header;

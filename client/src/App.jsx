import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import LiveTranscript from './components/LiveTranscript';
import SessionAnalytics from './components/SessionAnalytics';
import SourceFeed from './components/SourceFeed';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [claims, setClaims] = useState([]);
  // Start with 0 credibility - will be calculated as claims come in
  const [overallCredibility, setOverallCredibility] = useState(0);
  const [credibilityChange, setCredibilityChange] = useState(0);
  // Start with 0 stats - reset on every page refresh
  const [stats, setStats] = useState({ total: 0, true: 0, false: 0, misleading: 0 });
  const [processingClaim, setProcessingClaim] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [serverConnected, setServerConnected] = useState(false);
  const [showAllClaims, setShowAllClaims] = useState(false);
  const socketRef = useRef(null);
  const sessionStartRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const interimTextRef = useRef('');

  useEffect(() => {
    // Initialize Socket.IO connection with better error handling
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to server');
      setServerConnected(true);
    });

    socketRef.current.on('disconnect', (reason) => {
      // Only log if it's not a normal client disconnect (e.g., navigating away)
      if (reason !== 'io client disconnect') {
        console.log('❌ Disconnected from server:', reason);
      }
      setServerConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      // Only log if it's not a normal connection attempt
      if (error.message && !error.message.includes('xhr poll error')) {
        console.warn('⚠️ Server connection error (server may not be running):', error.message);
      }
      setServerConnected(false);
    });

    socketRef.current.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect to server...');
    });

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected to server after ${attemptNumber} attempts`);
      setServerConnected(true);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.warn('⚠️ Failed to reconnect. Please make sure the backend server is running.');
      setServerConnected(false);
    });

    socketRef.current.on('claim-processing', (data) => {
      // Show claims being processed
      if (data.claims && data.claims.length > 0) {
        const firstClaim = data.claims[0];
        if (firstClaim.claim) {
          setProcessingClaim(firstClaim.claim);
        }
      }
    });

    socketRef.current.on('claims-verified', (data) => {
      const newClaims = data.claims || [];
      
      if (newClaims.length > 0) {
        console.log('📊 New claims received:', newClaims.map(c => `${c.verdict}: ${c.claim.substring(0, 30)}`));
        
        // Add new claims to the list and calculate credibility
        setClaims(prev => {
          // Avoid duplicates by checking claim text (normalized)
          const existingTexts = new Set(prev.map(c => c.claim.toLowerCase().trim()));
          const uniqueNewClaims = newClaims.filter(c => !existingTexts.has(c.claim.toLowerCase().trim()));
          const allClaims = [...uniqueNewClaims, ...prev];
          
          // Remove duplicates from all claims
          const uniqueAllClaims = [];
          const seen = new Set();
          allClaims.forEach(c => {
            const key = c.claim.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              uniqueAllClaims.push(c);
            }
          });
          
          // Calculate stats from ALL unique claims
          const trueCount = uniqueAllClaims.filter(c => c.verdict === 'true').length;
          const falseCount = uniqueAllClaims.filter(c => c.verdict === 'false').length;
          const misleadingCount = uniqueAllClaims.filter(c => c.verdict === 'misleading').length;
          const total = trueCount + falseCount + misleadingCount;
          
          // Update stats immediately
          setStats({
            true: trueCount,
            false: falseCount,
            misleading: misleadingCount,
            total: total
          });
          
          // Update credibility score based on true vs false ratio
          if (total > 0) {
            // Calculate credibility: (true * 100 + misleading * 50 + false * 0) / total
            const credibilityScore = Math.round(
              (trueCount * 100 + misleadingCount * 50 + falseCount * 0) / total
            );
            
            const oldScore = overallCredibility;
            setOverallCredibility(credibilityScore);
            setCredibilityChange(credibilityScore - oldScore);
            console.log(`📊 Credibility: ${credibilityScore}% (${trueCount} true, ${falseCount} false, ${misleadingCount} misleading)`);
          }
          
          console.log(`📈 Stats updated: ${trueCount} TRUE, ${falseCount} FALSE, ${misleadingCount} MIXED`);
          
          return uniqueAllClaims;
        });
      }

      // Clear processing claim
      setProcessingClaim(null);
    });

    socketRef.current.on('error', (error) => {
      // Only log significant errors, not connection attempts
      if (error.message && !error.message.includes('xhr poll error') && !error.message.includes('transport close')) {
        console.warn('Socket error:', error.message);
      }
    });

    return () => {
      if (socketRef.current) {
        // Gracefully disconnect without logging
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Save session on component unmount if there's an active session
  useEffect(() => {
    return () => {
      // On unmount, save session if it exists
      if (sessionStartRef.current && accumulatedTranscriptRef.current.trim()) {
        const autoSave = localStorage.getItem('livetruth_autoSave') !== 'false';
        if (!autoSave) return;

        const currentUser = localStorage.getItem('livetruth_user');
        const userEmail = currentUser ? JSON.parse(currentUser).email : null;
        if (!userEmail) return;

        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        if (duration === 0) return;

        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        const durationFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const session = {
          id: Date.now(),
          userEmail: userEmail,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          duration: durationFormatted,
          claims: claimsRef.current.length,
          trueCount: statsRef.current.true || 0,
          falseCount: statsRef.current.false || 0,
          mixedCount: statsRef.current.misleading || 0,
          credibility: credibilityRef.current || 0,
          transcript: accumulatedTranscriptRef.current || '',
          createdAt: new Date().toISOString()
        };

        const existingSessions = JSON.parse(localStorage.getItem('livetruth_sessions') || '[]');
        const updatedSessions = [session, ...existingSessions];
        localStorage.setItem('livetruth_sessions', JSON.stringify(updatedSessions));
      }
    };
  }, []);

  // Stats are now calculated from claims in memory (reset on page refresh)
  // No need to fetch from database - fresh session starts fresh

  // Refs to track latest values for session saving
  const claimsRef = useRef([]);
  const statsRef = useRef({ total: 0, true: 0, false: 0, misleading: 0 });
  const credibilityRef = useRef(0);

  // Update refs when state changes
  useEffect(() => {
    claimsRef.current = claims;
  }, [claims]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    credibilityRef.current = overallCredibility;
  }, [overallCredibility]);

  // Session timer and auto-save
  useEffect(() => {
    if (isListening && !sessionStartRef.current) {
      sessionStartRef.current = Date.now();
      // Reset transcript when starting a new session
      accumulatedTranscriptRef.current = '';
      interimTextRef.current = '';
      setTranscript('');
      setClaims([]);
      setStats({ total: 0, true: 0, false: 0, misleading: 0 });
      setOverallCredibility(0);
      setCredibilityChange(0);
    }

    let interval;
    if (isListening) {
      interval = setInterval(() => {
        if (sessionStartRef.current) {
          const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
          setSessionTime(elapsed);
        }
      }, 1000);
    } else {
      // When listening stops, save the session
      if (sessionStartRef.current) {
        const sessionStartTime = sessionStartRef.current;
        
        // Small delay to ensure all state updates are complete
        setTimeout(() => {
          // Check if auto-save is enabled
          const autoSave = localStorage.getItem('livetruth_autoSave') !== 'false';
          if (!autoSave) {
            sessionStartRef.current = null;
            setSessionTime(0);
            return;
          }

          // Get current user
          const currentUser = localStorage.getItem('livetruth_user');
          const userEmail = currentUser ? JSON.parse(currentUser).email : null;
          if (!userEmail) {
            sessionStartRef.current = null;
            setSessionTime(0);
            return;
          }

          // Get latest values from refs
          const latestClaims = claimsRef.current;
          const latestStats = statsRef.current;
          const latestCredibility = credibilityRef.current;
          const latestTranscript = accumulatedTranscriptRef.current || transcript || '';

          // Only save if there's actual content
          if (!latestTranscript.trim() && latestClaims.length === 0) {
            sessionStartRef.current = null;
            setSessionTime(0);
            return;
          }

          // Calculate session duration
          const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
          
          if (duration === 0) {
            sessionStartRef.current = null;
            setSessionTime(0);
            return; // Don't save empty sessions
          }

          // Format duration as MM:SS
          const mins = Math.floor(duration / 60);
          const secs = duration % 60;
          const durationFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

          // Create session object
          const session = {
            id: Date.now(), // Use timestamp as unique ID
            userEmail: userEmail,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            time: new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            duration: durationFormatted,
            claims: latestClaims.length,
            trueCount: latestStats.true || 0,
            falseCount: latestStats.false || 0,
            mixedCount: latestStats.misleading || 0,
            credibility: latestCredibility || 0,
            transcript: latestTranscript,
            createdAt: new Date().toISOString()
          };

          // Load existing sessions
          const existingSessions = JSON.parse(localStorage.getItem('livetruth_sessions') || '[]');
          
          // Add new session at the beginning
          const updatedSessions = [session, ...existingSessions];
          
          // Save to localStorage
          localStorage.setItem('livetruth_sessions', JSON.stringify(updatedSessions));
          
          console.log('✅ Session saved:', session);
        }, 500);
      }
      sessionStartRef.current = null;
      setSessionTime(0);
      // Keep transcript visible after stopping
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, transcript]);

  const handleTranscript = (text, isFinal) => {
    if (isFinal) {
      // When final, append to accumulated transcript
      accumulatedTranscriptRef.current = accumulatedTranscriptRef.current 
        ? accumulatedTranscriptRef.current + ' ' + text.trim()
        : text.trim();
      
      // Update state with accumulated transcript
      setTranscript(accumulatedTranscriptRef.current);
      interimTextRef.current = '';
      
      // Process the FULL accumulated transcript for claims (not just new segment)
      // This ensures we check all statements together
      if (socketRef.current && accumulatedTranscriptRef.current.trim().length > 10) {
        // Detect potential claims and set as processing
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const lastSentence = sentences[sentences.length - 1];
        if (lastSentence) {
          setProcessingClaim(lastSentence.trim());
        }
        // Send the FULL accumulated transcript for processing (so all claims are checked)
        socketRef.current.emit('transcript', { 
          text: accumulatedTranscriptRef.current, 
          isFinal 
        });
      }
    } else {
      // For interim results, show accumulated + current interim
      interimTextRef.current = text;
      setTranscript(accumulatedTranscriptRef.current + (accumulatedTranscriptRef.current ? ' ' : '') + interimTextRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-blue transition-colors duration-300">
      {/* Header */}
      <Header 
        isListening={isListening}
        setIsListening={setIsListening}
        onTranscript={handleTranscript}
      />

      {/* Server Connection Warning */}
      {!serverConnected && (
        <div className="bg-yellow-900/50 border-b border-yellow-700 px-4 py-2">
          <div className="container mx-auto max-w-7xl flex items-center gap-2 text-yellow-200 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Backend server not connected. Please start the server with <code className="bg-yellow-800/50 px-2 py-1 rounded mx-1">npm run server</code> or <code className="bg-yellow-800/50 px-2 py-1 rounded mx-1">npm run dev</code></span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Live Transcript (2/3 width) */}
          <div className="lg:col-span-2">
            <LiveTranscript 
              transcript={transcript}
              claims={claims}
              processingClaim={processingClaim}
              sessionTime={formatTime(sessionTime)}
            />
          </div>

          {/* Right Column - Analytics & Feed (1/3 width) */}
          <div className="space-y-6">
            <SessionAnalytics 
              credibility={overallCredibility}
              credibilityChange={credibilityChange}
              stats={stats}
            />
            <SourceFeed claims={claims} showAll={showAllClaims} onShowAll={() => setShowAllClaims(true)} onClose={() => setShowAllClaims(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

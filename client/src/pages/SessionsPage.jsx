import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    // Get current logged-in user
    const currentUser = localStorage.getItem('livetruth_user');
    const userEmail = currentUser ? JSON.parse(currentUser).email : null;

    if (!userEmail) {
      // No user logged in, show empty state
      setSessions([]);
      return;
    }

    // Load sessions from localStorage and filter by user
    const savedSessions = localStorage.getItem('livetruth_sessions');
    if (savedSessions) {
      const allSessions = JSON.parse(savedSessions);
      // Filter sessions by current user's email
      const userSessions = allSessions.filter(session => session.userEmail === userEmail);
      setSessions(userSessions);
    } else {
      // No sessions found for this user
      setSessions([]);
    }
  }, []);

  const deleteSession = (id) => {
    // Get current logged-in user
    const currentUser = localStorage.getItem('livetruth_user');
    const userEmail = currentUser ? JSON.parse(currentUser).email : null;

    if (!userEmail) return;

    // Load all sessions, filter by user, remove the deleted one, and save
    const savedSessions = localStorage.getItem('livetruth_sessions');
    if (savedSessions) {
      const allSessions = JSON.parse(savedSessions);
      const userSessions = allSessions.filter(s => s.userEmail === userEmail);
      const otherUsersSessions = allSessions.filter(s => s.userEmail !== userEmail);
      const updatedUserSessions = userSessions.filter(s => s.id !== id);
      
      // Combine updated user sessions with other users' sessions
      const updated = [...otherUsersSessions, ...updatedUserSessions];
      localStorage.setItem('livetruth_sessions', JSON.stringify(updated));
      setSessions(updatedUserSessions);
    }
    setSelectedSession(null);
  };

  const clearAllSessions = () => {
    // Get current logged-in user
    const currentUser = localStorage.getItem('livetruth_user');
    const userEmail = currentUser ? JSON.parse(currentUser).email : null;

    if (!userEmail) return;

    if (confirm('Are you sure you want to delete all your sessions?')) {
      // Load all sessions, keep other users' sessions, remove only current user's
      const savedSessions = localStorage.getItem('livetruth_sessions');
      if (savedSessions) {
        const allSessions = JSON.parse(savedSessions);
        const otherUsersSessions = allSessions.filter(s => s.userEmail !== userEmail);
        localStorage.setItem('livetruth_sessions', JSON.stringify(otherUsersSessions));
      }
      setSessions([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v18M8 8v8M16 6v12M4 11v2M20 9v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              LiveTruth
            </span>
          </Link>
          <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
            <p className="text-gray-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded</p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={clearAllSessions}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">No Sessions Yet</h2>
            <p className="text-gray-400 mb-6">Start a fact-checking session to see your history here</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Start New Session
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="lg:col-span-1 space-y-4">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left bg-gray-800 rounded-xl border p-4 transition-all ${
                    selectedSession?.id === session.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{session.date}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      session.credibility >= 70 ? 'bg-green-600/20 text-green-400' :
                      session.credibility >= 40 ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {session.credibility}%
                    </span>
                  </div>
                  <p className="font-medium text-white mb-1">{session.time} • {session.duration}</p>
                  <div className="flex gap-3 text-sm text-gray-400">
                    <span className="text-green-400">{session.trueCount} true</span>
                    <span className="text-red-400">{session.falseCount} false</span>
                    <span className="text-yellow-400">{session.mixedCount} mixed</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Session Details */}
            <div className="lg:col-span-2">
              {selectedSession ? (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Session Details</h2>
                    <button
                      onClick={() => deleteSession(selectedSession.id)}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{selectedSession.trueCount}</p>
                      <p className="text-sm text-gray-400">True</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">{selectedSession.falseCount}</p>
                      <p className="text-sm text-gray-400">False</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{selectedSession.mixedCount}</p>
                      <p className="text-sm text-gray-400">Mixed</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">{selectedSession.credibility}%</p>
                      <p className="text-sm text-gray-400">Credibility</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Transcript</h3>
                    <div className="bg-gray-700/50 rounded-xl p-4 max-h-60 overflow-y-auto">
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedSession.transcript}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/export?session=${selectedSession.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-gray-400">Select a session to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SessionsPage;

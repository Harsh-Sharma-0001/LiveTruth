import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AnalyticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalClaims: 0,
    trueCount: 0,
    falseCount: 0,
    mixedCount: 0,
    avgCredibility: 0,
    totalDuration: '0:00'
  });

  // ... (keeping other handlers unchanged)

  useEffect(() => {
    // ... (keeping current useEffect logic)
    // Get current logged-in user
    const currentUser = localStorage.getItem('livetruth_user');
    const userEmail = currentUser ? JSON.parse(currentUser).email : null;

    if (!userEmail) {
      // No user logged in, show empty stats
      setStats({
        totalSessions: 0,
        totalClaims: 0,
        trueCount: 0,
        falseCount: 0,
        mixedCount: 0,
        avgCredibility: 0,
        totalDuration: '0:00'
      });
      return;
    }

    // Load analytics from localStorage and filter by user
    const savedSessions = localStorage.getItem('livetruth_sessions');
    if (savedSessions) {
      const allSessions = JSON.parse(savedSessions);
      // Filter sessions by current user's email
      const userSessions = allSessions.filter(session => session.userEmail === userEmail);
      
      if (userSessions.length === 0) {
        setStats({
          totalSessions: 0,
          totalClaims: 0,
          trueCount: 0,
          falseCount: 0,
          mixedCount: 0,
          avgCredibility: 0,
          totalDuration: '0:00'
        });
        return;
      }

      const totalClaims = userSessions.reduce((sum, s) => sum + (s.claims || 0), 0);
      const trueCount = userSessions.reduce((sum, s) => sum + (s.trueCount || 0), 0);
      const falseCount = userSessions.reduce((sum, s) => sum + (s.falseCount || 0), 0);
      const mixedCount = userSessions.reduce((sum, s) => sum + (s.mixedCount || 0), 0);
      const avgCredibility = userSessions.length > 0 
        ? Math.round(userSessions.reduce((sum, s) => sum + (s.credibility || 0), 0) / userSessions.length)
        : 0;

      // Calculate total duration from sessions
      const totalSeconds = userSessions.reduce((sum, s) => {
        if (s.duration) {
          const parts = s.duration.split(':');
          if (parts.length === 2) {
            return sum + (parseInt(parts[0]) * 60) + parseInt(parts[1]);
          }
        }
        return sum;
      }, 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const totalDuration = hours > 0 
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;

      setStats({
        totalSessions: userSessions.length,
        totalClaims,
        trueCount,
        falseCount,
        mixedCount,
        avgCredibility,
        totalDuration
      });
    } else {
      // No sessions found
      setStats({
        totalSessions: 0,
        totalClaims: 0,
        trueCount: 0,
        falseCount: 0,
        mixedCount: 0,
        avgCredibility: 0,
        totalDuration: '0:00'
      });
    }
  }, []);

  const accuracyRate = stats.totalClaims > 0 
    ? Math.round((stats.trueCount / stats.totalClaims) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#1a1f2e] dark:bg-black text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
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
          </div>
          {/* Empty right side */}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your fact-checking performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm">Sessions</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalSessions}</p>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm">Claims Verified</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalClaims}</p>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm">Accuracy Rate</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{accuracyRate}%</p>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm">Total Time</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalDuration}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Verdict Distribution */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6">Verdict Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-400">True</span>
                  <span className="text-gray-400">{stats.trueCount} ({Math.round((stats.trueCount / (stats.totalClaims || 1)) * 100)}%)</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.trueCount / (stats.totalClaims || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">False</span>
                  <span className="text-gray-400">{stats.falseCount} ({Math.round((stats.falseCount / (stats.totalClaims || 1)) * 100)}%)</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.falseCount / (stats.totalClaims || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400">Mixed</span>
                  <span className="text-gray-400">{stats.mixedCount} ({Math.round((stats.mixedCount / (stats.totalClaims || 1)) * 100)}%)</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.mixedCount / (stats.totalClaims || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Credibility Score */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6">Average Credibility</h2>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats.avgCredibility / 100) * 553} 553`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-green-400">{stats.avgCredibility}</span>
                  <span className="text-gray-400 text-sm">Credibility Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link
            to="/sessions"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            View All Sessions
          </Link>
          <Link
            to="/export"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;

import { useEffect, useState } from 'react';

function SessionAnalytics({ credibility, credibilityChange, stats }) {
  const [animatedCredibility, setAnimatedCredibility] = useState(0);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // On initial mount, start from 0 and animate
    if (isInitialMount) {
      setIsInitialMount(false);
      // Small delay to ensure smooth animation start
      const timer = setTimeout(() => {
        setAnimatedCredibility(credibility);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      // On subsequent updates, animate to new value
      setAnimatedCredibility(credibility);
    }
  }, [credibility, isInitialMount]);

  const getCredibilityLabel = (score) => {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MODERATE';
    return 'LOW';
  };

  const getCredibilityColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMeterColor = (score) => {
    if (score >= 70) return '#22c55e'; // green
    if (score >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Session Analytics</h2>
          {credibilityChange !== 0 && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${credibilityChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}
            >
              <svg
                className={`w-4 h-4 ${credibilityChange > 0 ? '' : 'rotate-180'
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {credibilityChange > 0 ? '+' : ''}
              {credibilityChange}%
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Semi-Circular Gauge */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3">
            <svg
              className="w-64 h-40"
              viewBox="0 0 200 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background Arc - Perfect semi-circle opening upward */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke="#374151"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Progress Arc - Perfect semi-circle opening upward */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke={getMeterColor(animatedCredibility)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 80}`}
                strokeDashoffset={Math.PI * 80 * (1 - animatedCredibility / 100)}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 10px ${getMeterColor(
                    animatedCredibility
                  )}80)`,
                }}
              />
            </svg>

            {/* Center Score - Positioned at the center of the arc */}
            <div 
              className="absolute flex items-center justify-center" 
              style={{ 
                left: '50%', 
                top: '65%', 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              <div className="text-center">
                <div
                  className={`text-5xl font-bold ${getCredibilityColor(
                    animatedCredibility
                  )} mb-1`}
                >
                  {Math.round(animatedCredibility)}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Credibility Score
                </div>
              </div>
            </div>
          </div>

          {/* Label */}
          <div
            className={`text-base font-bold ${getCredibilityColor(
              animatedCredibility
            )}`}
          >
            {getCredibilityLabel(animatedCredibility)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-700 rounded-xl p-5 text-center shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-shadow">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.true || 0}
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">
              TRUE
            </div>
          </div>

          <div className="bg-yellow-600 rounded-xl p-5 text-center shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 transition-shadow">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.misleading || 0}
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">
              MIXED
            </div>
          </div>

          <div className="bg-red-600 rounded-xl p-5 text-center shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-shadow">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.false || 0}
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">
              FALSE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionAnalytics;

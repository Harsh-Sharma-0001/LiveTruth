import ViewAllModal from './ViewAllModal';
import { useState } from 'react';

function SourceFeed({ claims, showAll, onShowAll, onClose }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getStatusIcon = (verdict) => {
    switch (verdict) {
      case 'true':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'false':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'misleading':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusLabel = (verdict) => {
    switch (verdict) {
      case 'true':
        return 'VERIFIED';
      case 'false':
        return 'FALSE';
      case 'misleading':
        return 'MISLEADING';
      default:
        return 'CHECKING...';
    }
  };

  const getStatusColor = (verdict) => {
    switch (verdict) {
      case 'true':
        return 'text-green-500';
      case 'false':
        return 'text-red-500';
      case 'misleading':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const claimTime = new Date(timestamp);
    const diffMs = now - claimTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Sort claims by timestamp (most recent first)
  const sortedClaims = [...claims].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Source Feed</h2>
        {claims.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View All
          </button>
        )}
      </div>

      {/* Feed Content */}
      <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
        {sortedClaims.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No claims verified yet. Start speaking to see real-time fact-checking...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {sortedClaims.map((claim, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getStatusIcon(claim.verdict || 'unverified')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase ${getStatusColor(claim.verdict || 'unverified')}`}>
                        {getStatusLabel(claim.verdict || 'unverified')}
                      </span>
                      {claim.verdict === 'unverified' && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      "{claim.claim}"
                    </p>
                    {claim.explanation && (
                      <p className="text-xs text-gray-500 mb-2">
                        Context: {claim.explanation}
                      </p>
                    )}
                    {claim.sources && claim.sources.length > 0 && (
                      <a 
                        href={claim.sources[0].url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Source: {claim.sources[0].title || 'View Source'}
                      </a>
                    )}
                    {claim.timestamp && (
                      <div className="mt-2 text-xs text-gray-500">
                        {getTimeAgo(claim.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View All Modal */}
      {isModalOpen && (
        <ViewAllModal 
          claims={claims} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default SourceFeed;

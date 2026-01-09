function ViewAllModal({ claims, onClose }) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">All Claims</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
          {sortedClaims.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No claims verified yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedClaims.map((claim, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(claim.verdict || 'unverified')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold uppercase ${getStatusColor(claim.verdict || 'unverified')}`}>
                          {getStatusLabel(claim.verdict || 'unverified')}
                        </span>
                        {claim.confidence !== undefined && (
                          <span className="text-xs text-gray-500">
                            ({Math.round(claim.confidence)}% confidence)
                          </span>
                        )}
                      </div>
                      <p className="text-base text-gray-200 mb-3">
                        "{claim.claim}"
                      </p>
                      {claim.explanation && (
                        <p className="text-sm text-gray-400 mb-3">
                          <span className="font-semibold">Context:</span> {claim.explanation}
                        </p>
                      )}
                      {claim.sources && claim.sources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-400 mb-2">Sources:</p>
                          <div className="space-y-2">
                            {claim.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {idx + 1}. {source.title || source.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {claim.timestamp && (
                        <div className="text-xs text-gray-500">
                          {new Date(claim.timestamp).toLocaleString()} ({getTimeAgo(claim.timestamp)})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Total: {sortedClaims.length} claims
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewAllModal;

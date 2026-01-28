import { useRef, useEffect } from 'react';

function LiveTranscript({ transcript, claims, processingClaim, sessionTime }) {
  const transcriptRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Create highlighted transcript with claim markers
  const getHighlightedTranscript = () => {
    if (!transcript) return null;

    // Find all claim positions in transcript
    const claimPositions = [];
    
    
    claims.forEach(claim => {
      if (!claim.claim || claim.verdict === 'unverified') return;
      
      // CRITICAL FIX: Normalize verdict to lowercase (backend might send uppercase)
      const normalizedVerdict = claim.verdict?.toLowerCase() || 'mixed';
      
      const claimText = claim.claim.trim();
      if (claimText.length < 5) return;
      
      // Normalize both texts for better matching
      const transcriptLower = transcript.toLowerCase().replace(/\s+/g, ' '); // Normalize whitespace
      const claimTextLower = claimText.toLowerCase().replace(/\s+/g, ' ');
      
      // Try exact match first
      let searchIndex = 0;
      
      // Find all occurrences of the claim in transcript
      while (true) {
        const index = transcriptLower.indexOf(claimTextLower, searchIndex);
        if (index === -1) break;
        
        claimPositions.push({
          start: index,
          end: index + claimText.length,
          verdict: normalizedVerdict,
          claim: claim
        });
        
        searchIndex = index + 1;
      }
      
      // If no exact match, try partial match (for cases where claim text might be slightly different)
      if (claimPositions.filter(p => p.verdict === normalizedVerdict).length === 0) {
        const claimWords = claimTextLower.split(/\s+/).filter(w => w.length > 3);
        if (claimWords.length >= 2) {
          // Try to find at least 2 key words together
          const firstWord = claimWords[0];
          const secondWord = claimWords[1];
          const firstIndex = transcriptLower.indexOf(firstWord);
          if (firstIndex !== -1) {
            const secondIndex = transcriptLower.indexOf(secondWord, firstIndex);
            if (secondIndex !== -1 && secondIndex - firstIndex < 50) {
              // Found key words close together, use that as position
              claimPositions.push({
                start: firstIndex,
                end: Math.min(secondIndex + secondWord.length + 20, transcript.length),
                verdict: normalizedVerdict,
                claim: claim
              });
            }
          }
        }
      }
    });

    // Sort by position
    claimPositions.sort((a, b) => a.start - b.start);

    // Merge overlapping positions (keep the first one)
    const mergedPositions = [];
    claimPositions.forEach(pos => {
      const overlaps = mergedPositions.find(mp => 
        (pos.start >= mp.start && pos.start < mp.end) ||
        (pos.end > mp.start && pos.end <= mp.end) ||
        (pos.start <= mp.start && pos.end >= mp.end)
      );
      
      if (!overlaps) {
        mergedPositions.push(pos);
      }
    });

    // Create segments
    const segments = [];
    let lastIndex = 0;

    mergedPositions.forEach(pos => {
      // Add text before claim
      if (pos.start > lastIndex) {
        segments.push({
          text: transcript.substring(lastIndex, pos.start),
          type: 'normal'
        });
      }
      
      // Add highlighted claim
      segments.push({
        text: transcript.substring(pos.start, pos.end),
        type: pos.verdict,
        claim: pos.claim
      });
      
      lastIndex = pos.end;
    });

    // Add remaining text
    if (lastIndex < transcript.length) {
      segments.push({
        text: transcript.substring(lastIndex),
        type: 'normal'
      });
    }

    return segments.length > 0 ? segments : [{ text: transcript, type: 'normal' }];
  };

  const segments = getHighlightedTranscript();

  const getUnderlineClass = (type) => {
    switch (type) {
      case 'true':
        return 'underline decoration-green-500';
      case 'false':
        return 'underline decoration-red-500';
      case 'misleading':
      case 'mixed':
        return 'underline decoration-yellow-500';
      case 'source_only':
        return 'underline decoration-blue-500 decoration-dotted';
      default:
        return '';
    }
  };

  return (
    // FIX: Default is now gray-800 (Dark Blueish) instead of white. Dark mode is Black.
    <div className="bg-gray-800 dark:bg-gray-900 rounded-xl border border-gray-700 dark:border-gray-800 overflow-hidden shadow-lg h-full flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 dark:border-gray-800 flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* FIX: Text is white by default */}
            <h2 className="text-xl font-bold text-white">Live Transcript</h2>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              <span className="text-sm text-gray-400 font-medium">Real-time feed</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Transcript Content */}
      <div 
        ref={scrollRef}
        // FIX: Background is darker gray (900/50) instead of light gray (50/50)
        className="px-8 py-6 flex-1 overflow-y-auto bg-gray-900/50 dark:bg-gray-950/50"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
      >
        {segments ? (
          // FIX: Text is light gray by default
          <div className="text-gray-200 dark:text-gray-300 leading-relaxed text-base font-normal">
            {segments.map((segment, index) => (
              <span
                key={index}
                className={segment.type !== 'normal' ? getUnderlineClass(segment.type) : 'text-gray-200 dark:text-gray-300'}
                style={{
                  textDecorationThickness: segment.type !== 'normal' ? '3px' : 'none',
                  textUnderlineOffset: segment.type !== 'normal' ? '4px' : '0',
                  textDecorationColor: 
                    segment.type === 'true' ? '#22c55e' :
                    segment.type === 'false' ? '#ef4444' :
                    (segment.type === 'misleading' || segment.type === 'mixed') ? '#eab308' : 'transparent',
                  fontWeight: segment.type !== 'normal' ? '500' : 'normal'
                }}
              >
                {segment.text}
              </span>
            ))}
            {processingClaim && !transcript.toLowerCase().includes(processingClaim.toLowerCase()) && (
              <span 
                className="underline decoration-gray-500 decoration-2"
                style={{
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '3px',
                  color: '#6b7280'
                }}
              >
                {` ${processingClaim}`}
              </span>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center pt-20">Transcript will appear here as you speak...</p>
        )}
      </div>

      {/* Footer Status */}
      {/* FIX: Darker background and border */}
      <div className="px-6 py-4 border-t border-gray-700 dark:border-gray-800 bg-gray-800/80 dark:bg-black/80 flex items-center justify-between flex-none">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {processingClaim && (
            <>
              <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">Processing claim: "<span className="text-gray-300">{processingClaim.substring(0, 50)}{processingClaim.length > 50 ? '...' : ''}</span>"</span>
            </>
          )}
          {!processingClaim && (
            <span className="text-gray-500">Ready for transcription...</span>
          )}
        </div>
        <div className="text-sm text-gray-500 font-mono font-semibold">
          {sessionTime}
        </div>
      </div>
    </div>
  );
}

export default LiveTranscript;
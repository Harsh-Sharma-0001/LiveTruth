import { processTranscript } from '../services/mlService.js';

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Handle transcript chunks from client
    socket.on('transcript', async (data) => {
      try {
        const { text, isFinal } = data;
        
        if (!text || text.trim().length < 10) {
          return;
        }

        // Process transcript for claims and verification immediately - REAL-TIME
        if (isFinal) {
          // Process the new text segment immediately
          console.log('🔍 Processing transcript for claims:', text.substring(0, 50) + '...');
          
          try {
            const results = await processTranscript(text);
            
            console.log(`✅ Found ${results.length} verified claims`);
            if (results.length > 0) {
              console.log('Verdicts:', results.map(r => `${r.verdict.toUpperCase()}: "${r.claim.substring(0, 40)}"`));
            }
            
            // ALWAYS send response, even if empty (to clear processing status)
            socket.emit('claims-verified', {
              transcript: text,
              claims: results || [],
              timestamp: new Date()
            });

            // Broadcast to all clients (for demo purposes)
            if (results && results.length > 0) {
              io.emit('live-update', {
                transcript: text,
                claims: results
              });
            }
          } catch (error) {
            console.error('❌ Error processing transcript:', error);
            socket.emit('claims-verified', {
              transcript: text,
              claims: [],
              timestamp: new Date(),
              error: error.message
            });
          }
        } else {
          // For interim results, do quick claim detection (without full verification)
          // This provides faster feedback
          const { detectClaims } = await import('../services/mlService.js');
          const detectedClaims = detectClaims(text);
          
          if (detectedClaims && detectedClaims.length > 0) {
            // Send processing status
            socket.emit('claim-processing', {
              claims: detectedClaims.map(c => ({
                claim: c.text,
                verdict: 'unverified',
                confidence: c.confidence,
                entities: c.entities
              }))
            });
          }
        }
      } catch (error) {
        console.error('Error processing transcript:', error);
        socket.emit('error', { message: 'Error processing transcript' });
      }
    });

    // Handle manual claim verification request
    socket.on('verify-claim', async (data) => {
      try {
        const { claim } = data;
        const { verifyClaim } = await import('../services/mlService.js');
        const result = await verifyClaim(claim);
        
        socket.emit('claim-result', {
          claim,
          ...result
        });
      } catch (error) {
        console.error('Error verifying claim:', error);
        socket.emit('error', { message: 'Error verifying claim' });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
}

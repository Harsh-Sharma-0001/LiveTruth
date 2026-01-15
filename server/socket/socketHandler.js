import { processTranscript } from '../services/mlService.js';

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    // Client connected

    // Handle transcript chunks from client (Optimized Chunking)
    socket.on('process-chunk', async (data) => {
      try {
        const { text, isFinal } = data;
        
        if (!text || text.trim().length < 10) {
          return;
        }

        // Process ONLY the received chunk
        console.log(`📨 [Socket] Received chunk (${text.length} chars): "${text.substring(0, 50)}..."`);

        if (isFinal) {
          try {
            // Processing just this chunk, not the whole history
            // usage of processTranscript implicitly handles the 'Two-stage pipeline' 
            // via detectClaims inside mlService
            const results = await processTranscript(text);
            
            socket.emit('claims-verified', {
              transcript: text,
              claims: results || [],
              timestamp: new Date()
            });

            if (results && results.length > 0) {
              io.emit('live-update', {
                transcript: text,
                claims: results
              });
            }
          } catch (error) {
            console.error('Error processing chunk:', error);
            socket.emit('claims-verified', {
              transcript: text,
              claims: [],
              timestamp: new Date(),
              error: error.message
            });
          }
        }
      } catch (error) {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Error processing transcript chunk' });
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
      // Client disconnected
    });
  });
}

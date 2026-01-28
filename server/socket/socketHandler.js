import { checkSocketRateLimit } from '../middleware/rateLimiter.js';
import { addClaimJob, setIO } from '../services/queueService.js';
import nlp from 'compromise';

export function initializeSocket(io) {
  // Initialize Queue with IO instance
  setIO(io);

  io.on('connection', (socket) => {
    // Client connected

    // Track session context (last 3 finalized sentences)
    const sessionContext = [];

    // Buffer to hold incomplete text chunks per socket
    const socketBuffers = new Map();

    // Handle transcript chunks from client (Optimized Chunking with Buffering)
    socket.on('process-chunk', async (data) => {
      try {
        const { text, isFinal } = data;
        
        // Rate Limiting Check
        if (isFinal) {
           if (!checkSocketRateLimit(socket.id)) {
             socket.emit('error', { message: 'Rate limit exceeded. Please wait a moment.' });
             return; 
           }
        }
        
        if (!text || text.trim().length === 0) return;

        // 1. Get current buffer for this socket
        let buffer = socketBuffers.get(socket.id) || '';
        
        // 2. Append new text. Add space if needed to prevent word merging "hello" + "world" -> "helloworld"
        if (buffer && !buffer.endsWith(' ') && !text.startsWith(' ')) {
            buffer += ' ' + text;
        } else {
            buffer += text;
        }

        // 3. Check for sentence completion using NLP + Heuristics
        // Strategies:
        // A. Punctuation (. ? !)
        // B. " and " keyword (common separator in speech)
        // C. NLP Sentence detection
        // D. Safety valve (> 100 chars)

        // Pre-check: Does buffer contain " and "? Treat it as a splitter immediately
        let hasSplitter = buffer.match(/[.!?]+(\s+|$)/) || buffer.includes(' and ');

        if (hasSplitter || buffer.length > 100) { 
             let sentences = [];
             
             // Strategy 1: Split by " and " (very common in continuous speech)
             // We replace " and " with ". " to help NLP or just split directly
             let tempBuffer = buffer.replace(/\s+and\s+/g, '. ');
             
             // Strategy 2: Use NLP to parse into sentences
             const doc = nlp(tempBuffer);
             const json = doc.sentences().json();
             
             // Reconstruct sentences from NLP output
             sentences = json.map(s => s.text);

             // If NLP failed to split huge text (rare), force split by chunks
             if (sentences.length === 1 && sentences[0].length > 150) {
                 sentences = sentences[0].match(/.{1,150}(\s|$)/g) || [sentences[0]];
             }

             let remainingBuffer = '';

             // Check the LAST sentence. Is it actually complete?
             // If we didn't have explicit punctuation at the very end, the last sentence *might* be incomplete
             // e.g. "The sky is blue. The grass is" -> NLP might say 2 sentences, but "The grass is" is incomplete.
             const lastSent = sentences[sentences.length - 1];
             if (lastSent && !lastSent.match(/[.!?]$/)) {
                 // Check if it's grammatically complete (Subject + Verb + Object/Adjective)
                 // This is tricky, so simplified: If it's short (<50 chars) and no punctuation, keep it in buffer
                 if (lastSent.length < 50) {
                     remainingBuffer = sentences.pop(); // Remove from processing list and keep in buffer
                 }
             }

             // Process valid sentences
             for (const sent of sentences) {
                 const cleanSent = sent.trim();
                 // Filter out short noise
                 if (cleanSent.length > 10) { 
                     // It's a valid sentence to process
                     console.log(`📨 [Socket] Processing complete sentence: "${cleanSent}"`);
                     
                     try {
                        const currentContext = [...sessionContext];
                        
                        // Add job to queue
                        console.log(`📥 [Socket] Queuing job for socket ${socket.id}`);
                        await addClaimJob(cleanSent, currentContext, socket.id);
                        
                        // Notify client
                        socket.emit('claim-processing', { 
                            message: 'Processing claim...', 
                            transcript: cleanSent 
                        });
                        
                        // Update context
                        sessionContext.push(cleanSent);
                        if (sessionContext.length > 3) sessionContext.shift();
                        
                     } catch (error) {
                        console.error('Error queuing job:', error);
                     }
                 }
             }
             
             // Update buffer with remaining incomplete text
             socketBuffers.set(socket.id, remainingBuffer || '');
             if (remainingBuffer) {
                 console.log(`⏳ [Socket] Buffering remaining: "${remainingBuffer}"`);
             }
             
        } else {
            // No full sentence yet, just update buffer
            socketBuffers.set(socket.id, buffer);
            console.log(`⏳ [Socket] Buffering (${buffer.length} chars)...`);
        }

      } catch (error) {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Error processing transcript chunk' });
      }
    });

    // Handle manual claim verification request
    socket.on('verify-claim', async (data) => {
      if (!checkSocketRateLimit(socket.id)) {
         socket.emit('error', { message: 'Rate limit exceeded. Please wait a moment.' });
         return;
      }
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


import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processTranscript } from './mlService.js';

// Configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  lazyConnect: true, // Don't connect immediately
  retryStrategy: times => {
    // Retry only a few times, then stop
    if (times > 3) {
      return null; // Stop retrying
    }
    return 500;
  }
};

// IO Instance for emitting back to clients
let io = null;
let isRedisOnline = false;
let claimQueue = null;
let worker = null;

export function setIO(ioInstance) {
  io = ioInstance;
}

// Initialize Redis & Queue safely
(async () => {
  const connection = new IORedis(REDIS_CONFIG);
  
  // Handle connection errors specifically to avoid spam
  connection.on('error', (err) => {
    if (isRedisOnline) {
      // Only log if we were previously connected
      console.warn('⚠️ [Queue] Redis connection lost. Switching to Synchronous Fallback.');
    }
    isRedisOnline = false;
    // Silence further errors
    connection.disconnect(); 
  });

  try {
    await connection.connect();
    console.log('✅ [Queue] Redis connected. Background processing active.');
    isRedisOnline = true;

    // 1. The Queue (Producer)
    // Reuse the connected connection
    claimQueue = new Queue('claim-processing', { connection });

    // 2. The Worker (Consumer)
    worker = new Worker('claim-processing', async (job) => {
      const { text, context, socketId } = job.data;
      
      console.log(`👷 [Worker] Processing Job ${job.id} for socket ${socketId}`);
      
      const results = await processTranscript(text, context);
      
      emitResults(socketId, text, results);
      
      return results;
    }, { connection, concurrency: 5 });

    worker.on('failed', (job, err) => {
      console.error(`❌ [Worker] Job ${job.id} failed:`, err.message);
      if (io && job.data.socketId) {
        emitError(job.data.socketId, 'Processing failed');
      }
    });

  } catch (e) {
    // Connection failed at startup
    console.log('⚠️ [Queue] Redis not available (ECONNREFUSED). Using In-Memory Fallback.');
    isRedisOnline = false;
    // Ensure we don't keep trying
    connection.disconnect();
  }
})();

// Optimization: Shared result emitter
function emitResults(socketId, text, results) {
  if (io && socketId) {
    console.log(`📨 [Worker/Fallback] Sending results to socket ${socketId}`);
    
    io.to(socketId).emit('claims-verified', {
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
  }
}

function emitError(socketId, msg) {
    if (io && socketId) {
        io.to(socketId).emit('error', { message: msg });
    }
}

// Export functions to use the queue
export async function addClaimJob(text, context, socketId) {
  if (isRedisOnline && claimQueue) {
    try {
        return await claimQueue.add('verify-claim', 
            { text, context, socketId },
            { 
              attempts: 3, 
              backoff: { type: 'exponential', delay: 1000 },
              removeOnComplete: true
            }
        );
    } catch (e) {
        console.warn('⚠️ [Queue] Add job failed. Using fallback.');
        // Fallthrough to sync
    }
  }

  // FALLBACK: Synchronous Processing
  console.log(`⚠️ [Fallback] Processing synchronously: "${text.substring(0, 30)}..."`);
  
  // Non-blocking immediate execution (async)
  processTranscript(text, context)
    .then(results => emitResults(socketId, text, results))
    .catch(err => {
        console.error('Fallback processing error:', err.message);
        emitError(socketId, 'Processing error');
    });
    
  return null; // No job ID
}

// Graceful shutdown
export async function closeQueue() {
  if (claimQueue) await claimQueue.close();
  if (worker) await worker.close();
}

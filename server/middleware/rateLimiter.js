
import rateLimit from 'express-rate-limit';

// 1. API Rate Limiter
// Limits API calls to 100 per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Socket Rate Limiter
// Simple in-memory rate limiter for sockets
// In production, use Redis to share limits across nodes
const socketLimits = new Map();

// Configuration: 5 verifications per minute per socket
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export function checkSocketRateLimit(socketId) {
  const now = Date.now();
  const userHistory = socketLimits.get(socketId) || [];
  
  // Filter out requests older than the window
  const recentRequests = userHistory.filter(timestamp => now - timestamp < LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false; // Limit exceeded
  }
  
  // Add new request
  recentRequests.push(now);
  socketLimits.set(socketId, recentRequests);
  
  // Cleanup periodically
  if (socketLimits.size > 1000) {
    cleanupSocketLimits();
  }
  
  return true; // Allowed
}

function cleanupSocketLimits() {
  const now = Date.now();
  for (const [id, history] of socketLimits.entries()) {
    const valid = history.filter(t => now - t < LIMIT_WINDOW);
    if (valid.length === 0) {
      socketLimits.delete(id);
    } else {
      socketLimits.set(id, valid);
    }
  }
}

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from server directory
const envPath = join(__dirname, '.env');
console.log('🔍 Loading .env from:', envPath);
console.log('🔍 File exists:', existsSync(envPath));

// Try multiple paths
const pathsToTry = [
  envPath, // Explicit path
  join(process.cwd(), '.env'), // Current working directory
  '.env' // Relative to current directory
];

let loaded = false;
for (const path of pathsToTry) {
  if (existsSync(path)) {
    console.log(`🔍 Trying to load from: ${path}`);
    const result = dotenv.config({ path: path, override: false });
    if (!result.error) {
      console.log(`✅ Successfully loaded .env from: ${path}`);
      loaded = true;
      break;
    } else {
      console.log(`⚠️ Failed to load from ${path}:`, result.error.message);
    }
  }
}

if (!loaded) {
  // Last resort: try default location
  const result = dotenv.config();
  if (result.error) {
    console.error('❌ Failed to load .env file from any location');
  } else {
    console.log('✅ Loaded .env from default location');
    loaded = true;
  }
}

// Verify loaded variables
if (loaded) {
  console.log('🔍 Verifying loaded variables:');
  console.log('   GMAIL_USER:', process.env.GMAIL_USER ? `${process.env.GMAIL_USER.substring(0, 5)}...${process.env.GMAIL_USER.substring(process.env.GMAIL_USER.length - 5)}` : 'undefined');
  console.log('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? `${process.env.GMAIL_APP_PASSWORD.length} chars (${process.env.GMAIL_APP_PASSWORD.substring(0, 4)}...${process.env.GMAIL_APP_PASSWORD.substring(process.env.GMAIL_APP_PASSWORD.length - 4)})` : 'undefined');
  console.log('   DEVELOPER_EMAIL:', process.env.DEVELOPER_EMAIL ? `${process.env.DEVELOPER_EMAIL.substring(0, 5)}...` : 'undefined');
}

// Initialize email service after dotenv has loaded
initializeEmailService();

import claimRoutes from './routes/claims.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import { initializeSocket } from './socket/socketHandler.js';
import { processTranscript } from './services/mlService.js';
// Import email service to initialize and log configuration (after dotenv.config)
import { initializeEmailService } from './services/emailService.js';

// Log API status
const hasGeminiAPI = process.env.GEMINI_API_KEY && 
                     process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
                     process.env.GEMINI_API_KEY.length > 10;

const hasGoogleAPI = process.env.GOOGLE_API_KEY && 
                     process.env.GOOGLE_API_KEY !== 'your_google_api_key_here' &&
                     process.env.GOOGLE_SEARCH_ENGINE_ID &&
                     process.env.GOOGLE_SEARCH_ENGINE_ID !== 'your_search_engine_id_here';

console.log('\n🚀 LiveTruth - Real-Time Fact Checker');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (hasGeminiAPI) {
  console.log('✅ Gemini AI configured - Using fast AI-powered fact-checking');
} else {
  console.log('⚠️ Gemini API not configured');
  console.log('💡 Add GEMINI_API_KEY to server/.env for best accuracy');
  console.log('   Get key from: https://makersuite.google.com/app/apikey');
}

if (hasGoogleAPI) {
  console.log('✅ Google Custom Search API configured');
} else {
  console.log('⚠️ Google Custom Search API not configured (optional)');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (optional - app works without it)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livetruth';
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.warn('⚠️ MongoDB connection error (continuing without database):', err.message);
  console.log('💡 App will work but claims won\'t be saved. Start MongoDB or use MongoDB Atlas.');
});

// Routes
app.use('/api/claims', claimRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LiveTruth API is running' });
});

// Socket.IO connection handling
initializeSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

// Helper function to get environment variables (reads at runtime)
const getEnv = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

const CLIENT_URL = getEnv('CLIENT_URL', 'http://localhost:5173');
const SERVER_URL = getEnv('SERVER_URL', 'http://localhost:5000');

// Track which strategies are configured
let googleStrategyConfigured = false;
let githubStrategyConfigured = false;

// Initialize OAuth strategies (called after dotenv loads)
function initializeOAuthStrategies() {
  // Read environment variables at runtime
  const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
  const GITHUB_CLIENT_ID = getEnv('GITHUB_CLIENT_ID');
  const GITHUB_CLIENT_SECRET = getEnv('GITHUB_CLIENT_SECRET');

  // Configure Google OAuth Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    try {
      // Remove existing strategy if it exists
      if (passport._strategies.google) {
        passport.unuse('google');
      }
      
      passport.use('google', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user information from Google profile
          const user = {
            id: profile.id,
            email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
            name: profile.displayName || profile.name?.givenName || 'Google User',
            picture: profile.photos?.[0]?.value || null,
            provider: 'google'
          };
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }));
      googleStrategyConfigured = true;
      console.log('✅ Google OAuth strategy configured');
    } catch (error) {
      console.error('❌ Error configuring Google OAuth:', error.message);
    }
  } else {
    console.warn('⚠️ Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env');
  }

  // Configure GitHub OAuth Strategy
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    try {
      // Remove existing strategy if it exists
      if (passport._strategies.github) {
        passport.unuse('github');
      }
      
      passport.use('github', new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/github/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user information from GitHub profile
          const user = {
            id: profile.id.toString(),
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            name: profile.displayName || profile.username || 'GitHub User',
            username: profile.username,
            picture: profile.photos?.[0]?.value || null,
            provider: 'github'
          };
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }));
      githubStrategyConfigured = true;
      console.log('✅ GitHub OAuth strategy configured');
    } catch (error) {
      console.error('❌ Error configuring GitHub OAuth:', error.message);
    }
  } else {
    console.warn('⚠️ GitHub OAuth not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to server/.env');
  }
}

// Note: initializeOAuthStrategies() is called from server/index.js after dotenv loads

// Serialize user for session (not used with JWT, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

/**
 * Google OAuth Routes
 * Check strategy availability at request time
 */
router.get('/google', (req, res, next) => {
  // Check if credentials are available
  const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log('❌ Google OAuth: Missing credentials');
    return res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured',
      message: 'Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env'
    });
  }
  
  // Check if strategy is registered
  const hasStrategy = passport._strategies && passport._strategies.google;
  if (!hasStrategy) {
    console.log('❌ Google OAuth: Strategy not found, re-initializing...');
    initializeOAuthStrategies();
    // Check again after initialization
    if (!passport._strategies || !passport._strategies.google) {
      console.log('❌ Google OAuth: Strategy still not found after initialization');
      return res.status(503).json({
        success: false,
        error: 'Google OAuth strategy not initialized',
        message: 'Please restart the server'
      });
    }
  }
  
  console.log('✅ Google OAuth: Proceeding with authentication');
  // Use the strategy
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  try {
    passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=google_auth_failed` })(req, res, () => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect(`${CLIENT_URL}/auth?error=google_auth_failed`);
        }
        const token = generateToken(user);
        
        // Redirect to frontend with token
        res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&provider=google&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${CLIENT_URL}/auth?error=google_auth_failed`);
      }
    });
  } catch (error) {
    console.error('Google OAuth callback strategy error:', error);
    res.redirect(`${CLIENT_URL}/auth?error=google_oauth_not_configured`);
  }
});

/**
 * GitHub OAuth Routes
 * Check strategy availability at request time
 */
router.get('/github', (req, res, next) => {
  // Check if credentials are available
  const GITHUB_CLIENT_ID = getEnv('GITHUB_CLIENT_ID');
  const GITHUB_CLIENT_SECRET = getEnv('GITHUB_CLIENT_SECRET');
  
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.log('❌ GitHub OAuth: Missing credentials');
    return res.status(503).json({
      success: false,
      error: 'GitHub OAuth is not configured',
      message: 'Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to server/.env'
    });
  }
  
  // Check if strategy is registered
  const hasStrategy = passport._strategies && passport._strategies.github;
  if (!hasStrategy) {
    console.log('❌ GitHub OAuth: Strategy not found, re-initializing...');
    initializeOAuthStrategies();
    // Check again after initialization
    if (!passport._strategies || !passport._strategies.github) {
      console.log('❌ GitHub OAuth: Strategy still not found after initialization');
      return res.status(503).json({
        success: false,
        error: 'GitHub OAuth strategy not initialized',
        message: 'Please restart the server'
      });
    }
  }
  
  console.log('✅ GitHub OAuth: Proceeding with authentication');
  // Use the strategy
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  try {
    passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=github_auth_failed` })(req, res, () => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect(`${CLIENT_URL}/auth?error=github_auth_failed`);
        }
        const token = generateToken(user);
        
        // Redirect to frontend with token
        res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&provider=github&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`);
      } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        res.redirect(`${CLIENT_URL}/auth?error=github_auth_failed`);
      }
    });
  } catch (error) {
    console.error('GitHub OAuth callback strategy error:', error);
    res.redirect(`${CLIENT_URL}/auth?error=github_oauth_not_configured`);
  }
});

// Export router and initialization function
export default router;
export { initializeOAuthStrategies };
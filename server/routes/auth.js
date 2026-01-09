import express from 'express';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/forgot-password
 * Request password reset OTP
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists (in production, check database)
    const users = JSON.parse(process.env.DEMO_USERS || '[]');
    const user = users.find(u => u.email === email);
    
    // Always return success (security: don't reveal if email exists)
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { otp, expiresAt });

    // Send OTP email
    try {
      const emailResult = await sendOTPEmail(email, otp);
      if (emailResult.success) {
        // Success - only log OTP in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ OTP email sent to ${email} (OTP: ${otp} - dev only)`);
        } else {
          console.log(`✅ OTP email sent to ${email}`);
        }
        res.json({ 
          success: true, 
          message: 'If an account exists with this email, an OTP has been sent to your email address.' 
        });
      } else {
        // Email service not configured
        console.error(`❌ Gmail not configured. OTP for ${email}: ${otp}`);
        res.status(500).json({ 
          success: false,
          error: 'Email service not configured. Please contact support.',
          message: 'Failed to send OTP email. Please check server configuration.'
        });
      }
    } catch (error) {
      // Only log non-timeout errors to reduce console noise
      if (error.message && !error.message.includes('timeout') && !error.message.includes('ETIMEDOUT')) {
        console.error(`❌ Error sending OTP email to ${email}:`, error.message);
      }
      
      // Never return OTP in response - security risk
      // Only log it to server console for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ OTP for ${email} (for debugging only): ${otp}`);
      }
      
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to send email. Please check Gmail configuration in server/.env',
        message: 'Failed to send OTP email. Please try again later or contact support.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and reset password
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified - update password (in production, update database)
    // For now, update localStorage on client side
    otpStore.delete(email);

    res.json({ 
      success: true, 
      message: 'Password reset successful. Please sign in with your new password.' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/social-login
 * Handle social login (Google/GitHub)
 */
router.post('/social-login', async (req, res) => {
  try {
    console.log('📥 Social login request received');
    console.log('   Headers:', JSON.stringify(req.headers, null, 2));
    console.log('   Body:', JSON.stringify(req.body, null, 2));
    console.log('   Body type:', typeof req.body);
    console.log('   Body keys:', Object.keys(req.body || {}));
    
    const { provider } = req.body || {};

    if (!provider) {
      console.log('❌ Provider missing in request body. Body:', req.body);
      return res.status(400).json({ 
        success: false,
        error: 'Provider is required. Please send { "provider": "google" } or { "provider": "github" }' 
      });
    }

    if (provider !== 'google' && provider !== 'github') {
      console.log('❌ Invalid provider:', provider);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid provider. Use "google" or "github"' 
      });
    }

    // Generate unique user data for demo
    // In production, verify OAuth token and get real user data from provider
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    
    let userData;
    if (provider === 'google') {
      userData = {
        name: `Social User`,
        email: `social@google.com`,
        provider: 'google',
        picture: null
      };
    } else if (provider === 'github') {
      userData = {
        name: `Social User`,
        email: `social@github.com`,
        provider: 'github',
        username: `socialuser`
      };
    }

    console.log('✅ Social login successful for:', provider);
    res.json({ 
      success: true, 
      message: `Social login successful with ${provider}`,
      user: userData
    });
  } catch (error) {
    console.error('❌ Social login error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

export default router;

import express from 'express';
import { sendContactEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/contact
 * Send contact form message
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send email to developer
    try {
      const emailResult = await sendContactEmail(name, email, message);
      if (emailResult.success) {
        console.log(`✅ Contact form email sent from ${name} (${email})`);
        res.json({ 
          success: true, 
          message: 'Your message has been sent successfully. We\'ll get back to you soon!' 
        });
      } else {
        // Email service not configured
        console.error('❌ Gmail not configured. Contact form submission:', { name, email });
        res.status(500).json({ 
          success: false,
          error: 'Email service not configured. Please contact support directly.',
          message: 'Failed to send message. Please try again later or contact support directly.'
        });
      }
    } catch (error) {
      // Only log non-timeout errors to reduce console noise
      if (error.message && !error.message.includes('timeout') && !error.message.includes('ETIMEDOUT')) {
        console.error('❌ Contact email error:', error.message);
      }
      
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to send message. Please check Gmail configuration in server/.env',
        message: 'Failed to send message. Please try again later or contact support directly.'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

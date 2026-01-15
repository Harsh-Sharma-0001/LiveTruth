import nodemailer from 'nodemailer';

// Helper function to get Gmail config (reads from env at runtime)
function getGmailConfig() {
  const GMAIL_USER = process.env.GMAIL_USER?.trim(); // Your Gmail address
  // Remove spaces from app password (Gmail generates it with spaces, but we need it without)
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '').trim(); // Gmail App Password (16 characters, no spaces)
  const FROM_NAME = process.env.FROM_NAME || 'LiveTruth';
  const DEVELOPER_EMAIL = (process.env.DEVELOPER_EMAIL || GMAIL_USER)?.trim();
  
  return { GMAIL_USER, GMAIL_APP_PASSWORD, FROM_NAME, DEVELOPER_EMAIL };
}

// Get initial config for logging
const initialConfig = getGmailConfig();
const GMAIL_USER = initialConfig.GMAIL_USER;
const GMAIL_APP_PASSWORD = initialConfig.GMAIL_APP_PASSWORD;
const FROM_NAME = initialConfig.FROM_NAME;
const DEVELOPER_EMAIL = initialConfig.DEVELOPER_EMAIL;

// Create reusable transporter
let transporter = null;

// Initialize Gmail transporter (reads config at runtime)
function initializeTransporter() {
  const config = getGmailConfig();
  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass } = config;
  
  if (!user || !pass) {
    return null;
  }

  // If transporter exists and credentials haven't changed, reuse it
  if (transporter && transporter.options.auth.user === user) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
}

// Function to log email configuration (called after dotenv loads)
function logEmailConfiguration() {
  const config = getGmailConfig();
  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass, DEVELOPER_EMAIL: devEmail } = config;
  
  console.log('\n📧 Gmail Email Service Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Debug: Log what we're reading from environment
  if (process.env.GMAIL_USER) {
    console.log(`🔍 Found GMAIL_USER: ${process.env.GMAIL_USER.substring(0, 5)}...${process.env.GMAIL_USER.substring(process.env.GMAIL_USER.length - 5)}`);
  } else {
    console.log('🔍 GMAIL_USER from env: undefined');
  }

  if (process.env.GMAIL_APP_PASSWORD) {
    console.log(`🔍 Found GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD.length} characters`);
  } else {
    console.log('🔍 GMAIL_APP_PASSWORD from env: undefined');
  }

  if (user && pass && pass.length >= 16) {
    console.log(`✅ Gmail User: ${user}`);
    console.log(`✅ App Password: ${pass.substring(0, 4)}...${pass.substring(pass.length - 4)} (${pass.length} chars)`);
    console.log(`✅ Developer Email: ${devEmail}`);
    console.log('✅ Gmail SMTP configured and ready');
    
    // Test connection on startup (non-blocking, emails will still work)
    setTimeout(async () => {
      try {
        const testTransporter = initializeTransporter();
        if (testTransporter) {
          await testTransporter.verify();
          // Silent success - connection works
        }
      } catch (error) {
        // Only log if it's not a timeout (timeouts are common and emails still work)
        if (!error.message.includes('ETIMEDOUT') && !error.message.includes('timeout')) {
          console.warn('⚠️ Gmail SMTP connection test failed (emails may still work):', error.message);
        }
        // Timeout errors are common and don't prevent emails from being sent
      }
    }, 1000);
  } else {
    console.log('⚠️ Gmail not configured');
    console.log('💡 Add GMAIL_USER and GMAIL_APP_PASSWORD to server/.env');
    console.log('   Get App Password: https://myaccount.google.com/apppasswords');
    if (!user) {
      console.log('   ❌ GMAIL_USER is missing');
      console.log(`   🔍 Debug: process.env.GMAIL_USER = ${process.env.GMAIL_USER || 'undefined'}`);
    }
    if (!pass) {
      console.log('   ❌ GMAIL_APP_PASSWORD is missing');
      console.log(`   🔍 Debug: process.env.GMAIL_APP_PASSWORD = ${process.env.GMAIL_APP_PASSWORD ? 'exists but empty' : 'undefined'}`);
    } else if (pass.length < 16) {
      console.log(`   ❌ GMAIL_APP_PASSWORD is invalid (got ${pass.length} chars, need 16)`);
      console.log('   💡 Make sure to remove spaces from the app password');
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Export function to be called after dotenv loads
export function initializeEmailService() {
  logEmailConfiguration();
}

/**
 * Check if email service is configured (checks at runtime)
 */
export function isEmailConfigured() {
  const config = getGmailConfig();
  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass } = config;
  
  return user && 
         pass && 
         pass.length >= 16 &&
         user.includes('@gmail.com') &&
         user.length > 10;
}

/**
 * Send email using Gmail SMTP
 */
async function sendEmail(to, subject, htmlContent, textContent) {
  const config = getGmailConfig();
  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass, FROM_NAME: fromName } = config;
  
  if (!user || !pass) {
    throw new Error('Gmail not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env');
  }

  const mailTransporter = initializeTransporter();
  
  if (!mailTransporter) {
    throw new Error('Gmail not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env');
  }

  try {
    const mailOptions = {
      from: `"${fromName}" <${user}>`,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    // Send email directly (connection already verified on startup)
    // Retry logic for transient network errors
    let lastError;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`   Retrying... (attempt ${attempt}/${maxRetries})`);
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const info = await mailTransporter.sendMail(mailOptions);
        
        // Only log success, not every detail (to reduce console noise)
        if (attempt === 1) {
          // Silent success for normal sends
        } else {
          console.log(`✅ Email sent successfully to ${to} (after retry)`);
        }
        
        return { 
          success: true, 
          messageId: info.messageId 
        };
      } catch (sendError) {
        lastError = sendError;
        
        // Don't retry for authentication errors
        if (sendError.code === 'EAUTH' || sendError.responseCode === 535) {
          throw sendError;
        }
        
        // Retry only for network/timeout errors
        if (sendError.code === 'ECONNECTION' || sendError.code === 'ETIMEDOUT' || sendError.code === 'ESOCKET') {
          if (attempt < maxRetries) {
            console.warn(`⚠️ Network error (attempt ${attempt}/${maxRetries}): ${sendError.message}`);
            continue; // Retry
          }
        } else {
          // Other errors - don't retry
          throw sendError;
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
    
  } catch (error) {
    // Only log errors that aren't transient network issues (to reduce noise)
    if (error.code !== 'ETIMEDOUT' && error.code !== 'ESOCKET' && error.code !== 'ECONNECTION') {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      console.error('   Error code:', error.code);
    } else {
      // For timeout errors, just log a brief message
      console.warn(`⚠️ Network timeout sending email to ${to} (this is usually temporary)`);
    }
    
    // Provide helpful error messages
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      throw new Error('Gmail authentication failed. Please check your GMAIL_USER and GMAIL_APP_PASSWORD in server/.env. Make sure the app password is correct and 2-Step Verification is enabled.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      throw new Error('Failed to connect to Gmail SMTP. This may be a temporary network issue. Please try again.');
    } else if (error.responseCode === 550) {
      throw new Error(`Invalid recipient email address: ${to}`);
    } else if (error.code === 'EENVELOPE') {
      throw new Error(`Invalid email address format: ${to}`);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send OTP email for password reset
 */
export async function sendOTPEmail(email, otp) {
  if (!isEmailConfigured()) {
    console.warn(`⚠️ Gmail not configured. OTP for ${email}: ${otp}`);
    return { success: false, message: 'Gmail not configured. Use OTP: ' + otp };
  }

  const subject = 'LiveTruth - Password Reset OTP';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-box { background: white; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LiveTruth</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a password reset for your LiveTruth account. Use the OTP below to reset your password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin-top: 10px; color: #6b7280;">This OTP will expire in 10 minutes</p>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The LiveTruth Team</p>
        </div>
        <div class="footer">
          <p>© 2025 LiveTruth. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const textContent = `LiveTruth Password Reset\n\nYour OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

  try {
    const result = await sendEmail(email, subject, htmlContent, textContent);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
    throw error;
  }
}

/**
 * Send contact form email to developer
 */
export async function sendContactEmail(name, email, message) {
  const config = getGmailConfig();
  const { DEVELOPER_EMAIL: devEmail } = config;
  
  if (!isEmailConfigured()) {
    console.warn('⚠️ Gmail not configured. Contact form submission:', { name, email, message });
    return { success: false, message: 'Gmail not configured. Message logged.' };
  }

  if (!devEmail || devEmail === 'your_email@example.com') {
    console.warn('⚠️ Developer email not configured. Cannot send contact form email.');
    return { success: false, message: 'Developer email not configured.' };
  }

  const subject = `LiveTruth Contact Form - Message from ${name}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .message-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="info-box">
            <strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
          </div>
          <div class="message-box">
            <strong>Message:</strong>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
            This message was sent from the LiveTruth contact form.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  const textContent = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  try {
    const result = await sendEmail(devEmail, subject, htmlContent, textContent);
    // Success logging handled in route
    return result;
  } catch (error) {
    console.error(`❌ Failed to send contact email to ${DEVELOPER_EMAIL}:`, error.message);
    throw error;
  }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(email, name) {
  if (!isEmailConfigured()) {
    return { success: false };
  }

  const subject = 'Welcome to LiveTruth!';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to LiveTruth!</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for joining LiveTruth! We're excited to have you on board.</p>
          <p>LiveTruth helps you verify facts in real-time during live speeches and conversations.</p>
          <p>Get started by clicking "Start Listening" and begin fact-checking!</p>
          <p>Best regards,<br>The LiveTruth Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const textContent = `Welcome to LiveTruth!\n\nHello ${name},\n\nThank you for joining LiveTruth! We're excited to have you on board.\n\nGet started by clicking "Start Listening" and begin fact-checking!`;

  try {
    const result = await sendEmail(email, subject, htmlContent, textContent);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    // Don't throw - welcome email is not critical
    return { success: false };
  }
}

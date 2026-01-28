import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // UX State Separation
  const [activeAuthMethod, setActiveAuthMethod] = useState(null); // 'email', 'google', 'github', 'forgot-password'
  const [formError, setFormError] = useState('');
  const [oauthError, setOauthError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    const token = localStorage.getItem('livetruth_token');
    const user = localStorage.getItem('livetruth_user');
    
    // If user is already authenticated, redirect to dashboard
    if (token && user) {
      // Check if it's a demo token (for local development)
      if (token.startsWith('demo_token_')) {
        // Demo token - just redirect
        navigate('/', { replace: true });
        return;
      }
      
      // For JWT tokens, verify token is not expired
      try {
        if (token.includes('.')) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired
            localStorage.removeItem('livetruth_token');
            localStorage.removeItem('livetruth_user');
          } else {
            navigate('/', { replace: true });
          }
        } else {
          // Non-JWT token - accept it
          navigate('/', { replace: true });
        }
      } catch (error) {
        // If token parsing fails but it's a demo token, accept it
        if (token.startsWith('demo_token_')) {
          navigate('/', { replace: true });
        } else {
          // Invalid token
          localStorage.removeItem('livetruth_token');
          localStorage.removeItem('livetruth_user');
        }
      }
    }

    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      if (errorParam === 'oauth_failed' || errorParam === 'oauth_processing_failed') {
        setOauthError('OAuth authentication failed. Please try again.');
      } else if (errorParam === 'oauth_incomplete') {
        setOauthError('OAuth authentication incomplete. Please try again.');
      } else if (errorParam === 'google_oauth_not_configured' || errorParam === 'github_oauth_not_configured') {
        setOauthError('OAuth is not configured on the server. Please contact the administrator.');
      } else if (errorParam === 'google_auth_failed') {
        setOauthError('Google authentication failed. Please try again.');
      } else if (errorParam === 'github_auth_failed') {
        setOauthError('GitHub authentication failed. Please try again.');
      }
      // Clean URL
      window.history.replaceState({}, document.title, '/auth');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
    setOauthError(''); // Clear global errors on input interaction
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setOauthError('');
    setSuccess('');

    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setFormError('Please enter your name');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    setActiveAuthMethod('email');

    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('livetruth_users') || '[]');
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          // Login successful
          localStorage.setItem('livetruth_user', JSON.stringify({
            name: user.name,
            email: user.email,
            joinedDate: user.joinedDate,
            sessions: user.sessions || 0,
            claimsVerified: user.claimsVerified || 0,
            avgCredibility: user.avgCredibility || 0
          }));
          localStorage.setItem('livetruth_token', 'demo_token_' + Date.now());
          setSuccess('Login successful! Redirecting...');
          // Navigate immediately - the success message will show briefly
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          // Check if email exists
          const emailExists = users.find(u => u.email === formData.email);
          if (emailExists) {
            setFormError('Incorrect password');
          } else {
            setFormError('No account found with this email. Please register.');
          }
        }
      } else {
        // Register new user
        const users = JSON.parse(localStorage.getItem('livetruth_users') || '[]');
        
        // Check if email already exists
        if (users.find(u => u.email === formData.email)) {
          setFormError('An account with this email already exists');
          setActiveAuthMethod(null);
          return;
        }

        // Create new user
        const newUser = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          sessions: 0,
          claimsVerified: 0,
          avgCredibility: 0
        };

        users.push(newUser);
        localStorage.setItem('livetruth_users', JSON.stringify(users));
        
        // Auto login after registration
        localStorage.setItem('livetruth_user', JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          joinedDate: newUser.joinedDate,
          sessions: 0,
          claimsVerified: 0,
          avgCredibility: 0
        }));
        localStorage.setItem('livetruth_token', 'demo_token_' + Date.now());
        
        setSuccess('Account created successfully! Redirecting...');
        // Navigate immediately - the success message will show briefly
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
      
      setActiveAuthMethod(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] dark:bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v18M8 8v8M16 6v12M4 11v2M20 9v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              LiveTruth
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  isLogin ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  !isLogin ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={!showForgotPassword ? handleSubmit : (e) => e.preventDefault()} className="p-6 space-y-4">
              {/* Form Errors (Email/Password) */}
              {formError && (
                <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formError}
                </div>
              )}
              {success && (
                <div className="bg-green-600/20 border border-green-600/50 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              )}

              {/* Forgot Password Flow */}
              {showForgotPassword ? (
                <>
                  {!otpSent ? (
                    // Step 1: Request OTP
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                        <p className="text-gray-400 text-sm">Enter your email to receive a verification code.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="you@example.com"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!forgotPasswordEmail) {
                            setFormError('Please enter your email');
                            return;
                          }
                          
                          // Check if email exists in registered users (localStorage)
                          const users = JSON.parse(localStorage.getItem('livetruth_users') || '[]');
                          const userExists = users.find(u => u.email === forgotPasswordEmail);
                          
                          if (!userExists) {
                             setFormError('This email is not registered with us.');
                             return;
                          }

                          setFormError('');
                          setSuccess('');
                          setActiveAuthMethod('forgot-password');
                          
                          try {
                            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: forgotPasswordEmail })
                            });
                            const data = await res.json();
                            
                            if (data.success) {
                              setOtpSent(true);
                              setSuccess(data.message);
                              setFormError('');
                            } else {
                              setFormError(data.error || 'Failed to send OTP');
                            }
                          } catch (err) {
                            setFormError('Network error. Please try again.');
                          } finally {
                            setActiveAuthMethod(null);
                          }
                        }}
                        disabled={activeAuthMethod === 'forgot-password'}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                         {activeAuthMethod === 'forgot-password' ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending Code...
                          </>
                        ) : 'Send Verification Code'}
                      </button>
                    </div>
                  ) : (
                    // Step 2: Verify OTP & Reset
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">New Password</h3>
                        <p className="text-gray-400 text-sm">Enter the code sent to {forgotPasswordEmail}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code (OTP)</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-center tracking-widest text-lg font-mono"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Six characters minimum"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                         <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Confirm password"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!otp || !newPassword) {
                            setFormError('Please fill all fields');
                            return;
                          }
                          if (newPassword.length < 6) {
                            setFormError('Password must be at least 6 characters');
                            return;
                          }
                           if (newPassword !== confirmNewPassword) {
                            setFormError('Passwords do not match');
                            return;
                          }

                          setFormError('');
                          setSuccess('');
                          setActiveAuthMethod('verify-otp');
                          
                          try {
                            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: forgotPasswordEmail, otp, newPassword })
                            });
                            const data = await res.json();
                            
                            if (data.success) {
                              setSuccess('Password reset successful! You can now login.');
                              setOtpSent(false);
                              setOtp('');
                              setNewPassword('');
                              setConfirmNewPassword('');
                              // Return to login after delay
                              setTimeout(() => {
                                setShowForgotPassword(false);
                                setIsLogin(true);
                                setSuccess('Password reset successful! Please login with new password.');
                              }, 2000);
                            } else {
                              setFormError(data.error || 'Failed to reset password');
                            }
                          } catch (err) {
                            setFormError('Network error. Please try again.');
                          } finally {
                            setActiveAuthMethod(null);
                          }
                        }}
                        disabled={activeAuthMethod === 'verify-otp'}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                         {activeAuthMethod === 'verify-otp' ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resetting...
                          </>
                        ) : 'Reset Password'}
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center mt-4">
                     <button 
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setFormError('');
                        setSuccess('');
                        setOtpSent(false);
                      }}
                      className="text-gray-300 font-semibold hover:text-white text-sm transition-colors">
                      Wait, I remember my password
                    </button>
                  </div>
                </>
              ) : (
                // NORMAL LOGIN/REGISTER FORM
                <>
                  {/* Name (Register only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>
                  )}
    
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
    
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
    
                  {/* Confirm Password (Register only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
    
                  {/* Forgot Password (Login only) */}
                  {isLogin && (
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowForgotPassword(true);
                          setFormError(''); // Clear any existing errors
                          setSuccess(''); // Clear any existing success messages
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
    
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={activeAuthMethod !== null}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {activeAuthMethod === 'email' ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </button>
    
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-800 text-gray-400">or continue with</span>
                    </div>
                  </div>
    
                   {/* OAuth Errors */}
                  {oauthError && (
                    <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {oauthError}
                    </div>
                  )}
    
                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        if (activeAuthMethod) return; // Prevent double clicks
                        setActiveAuthMethod('google');
                        setOauthError('');
                        try {
                          // Check if OAuth is configured
                          const statusRes = await fetch('http://localhost:5000/api/oauth/status');
                          const status = await statusRes.json();
                          if (!status.google.configured) {
                            setOauthError('Google OAuth is not configured on the server. Please contact the administrator.');
                            setActiveAuthMethod(null);
                            return;
                          }
                          // Redirect to Google OAuth endpoint
                          window.location.href = 'http://localhost:5000/api/auth/google';
                        } catch (err) {
                          setOauthError('Failed to connect to server. Please try again.');
                          setActiveAuthMethod(null);
                        }
                      }}
                      disabled={activeAuthMethod !== null}
                      className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      {activeAuthMethod === 'google' ? (
                           <svg className="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                         if (activeAuthMethod) return; // Prevent double clicks
                         setActiveAuthMethod('github');
                         setOauthError('');
                        try {
                          // Check if OAuth is configured
                          const statusRes = await fetch('http://localhost:5000/api/oauth/status');
                          const status = await statusRes.json();
                          if (!status.github.configured) {
                            setOauthError('GitHub OAuth is not configured on the server. Please contact the administrator.');
                            setActiveAuthMethod(null);
                            return;
                          }
                          // Redirect to GitHub OAuth endpoint
                          window.location.href = 'http://localhost:5000/api/auth/github';
                        } catch (err) {
                          setOauthError('Failed to connect to server. Please try again.');
                          setActiveAuthMethod(null);
                        }
                      }}
                      disabled={activeAuthMethod !== null}
                      className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      {activeAuthMethod === 'github' ? (
                           <svg className="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      GitHub
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          {/* Terms */}
          <p className="text-center text-gray-500 text-sm mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;

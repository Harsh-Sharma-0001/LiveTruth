import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      // OAuth failed
      console.error('OAuth error:', error);
      navigate('/auth?error=oauth_failed', { replace: true });
      return;
    }

    if (token && email && name) {
      // OAuth successful - store token and user info
      try {
        // Decode JWT to get user info (basic decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Store JWT token
        localStorage.setItem('livetruth_token', token);
        
        // Store user info
        const userData = {
          name: name || payload.name,
          email: email || payload.email,
          provider: provider || payload.provider || 'oauth',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          sessions: 0,
          claimsVerified: 0,
          avgCredibility: 0
        };
        
        localStorage.setItem('livetruth_user', JSON.stringify(userData));
        
        // Also save to users list for consistency
        const users = JSON.parse(localStorage.getItem('livetruth_users') || '[]');
        const existingUserIndex = users.findIndex(u => u.email === email);
        
        if (existingUserIndex >= 0) {
          // Update existing user
          users[existingUserIndex] = {
            ...users[existingUserIndex],
            ...userData,
            provider: provider || 'oauth'
          };
        } else {
          // Add new user
          users.push({
            ...userData,
            password: null // No password for OAuth users
          });
        }
        
        localStorage.setItem('livetruth_users', JSON.stringify(users));
        
        // Redirect to dashboard
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        navigate('/auth?error=oauth_processing_failed', { replace: true });
      }
    } else {
      // Missing required parameters
      navigate('/auth?error=oauth_incomplete', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;

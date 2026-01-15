import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * ProtectedRoute component that checks if user is authenticated
 * Verifies JWT token and redirects to /auth if not authenticated
 */
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('livetruth_token');
      const user = localStorage.getItem('livetruth_user');

      if (!token || !user) {
        setIsAuthenticated(false);
        return;
      }

      // Verify token is valid
      try {
        // Check if it's a demo token (for local development)
        if (token.startsWith('demo_token_')) {
          // Demo token - just check if it exists and user exists
          setIsAuthenticated(true);
          return;
        }
        
        // For JWT tokens, validate format and expiration
        if (token.includes('.')) {
          // Basic JWT validation - check if token is expired
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired
            localStorage.removeItem('livetruth_token');
            localStorage.removeItem('livetruth_user');
            setIsAuthenticated(false);
            return;
          }

          // Token is valid
          setIsAuthenticated(true);
        } else {
          // Non-JWT token format - accept it if user exists
          setIsAuthenticated(true);
        }
      } catch (error) {
        // If token parsing fails but it's a demo token, accept it
        if (token.startsWith('demo_token_')) {
          setIsAuthenticated(true);
        } else {
          // Invalid token format
          localStorage.removeItem('livetruth_token');
          localStorage.removeItem('livetruth_user');
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the protected component
  return children;
}

export default ProtectedRoute;

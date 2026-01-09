import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component that checks if user is authenticated
 * Redirects to /auth if not authenticated, otherwise renders the protected component
 */
function ProtectedRoute({ children }) {
  // Check authentication by looking for token and user in localStorage
  const token = localStorage.getItem('livetruth_token');
  const user = localStorage.getItem('livetruth_user');

  // User is authenticated if both token and user exist
  const isAuthenticated = !!(token && user);

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the protected component
  return children;
}

export default ProtectedRoute;

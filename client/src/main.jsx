import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AboutPage from './pages/AboutPage.jsx'
import HelpPage from './pages/HelpPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SessionsPage from './pages/SessionsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ExportPage from './pages/ExportPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import './index.css'

// Suppress browser extension errors and harmless errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  const errorSource = event.filename || '';
  const errorString = event.error?.toString() || '';
  
  // Suppress extension-related errors
  if (
    errorMessage.includes('message channel closed') ||
    errorMessage.includes('asynchronous response') ||
    errorMessage.includes('listener indicated') ||
    errorMessage.includes('Extension context invalidated') ||
    errorMessage.includes('chrome-extension://') ||
    errorMessage.includes('moz-extension://') ||
    errorSource.includes('chrome-extension://') ||
    errorSource.includes('moz-extension://') ||
    errorString.includes('message channel closed') ||
    errorString.includes('asynchronous response')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  // Suppress audio/video playback errors (browser autoplay policies)
  if (
    errorMessage.includes('play() request was interrupted') ||
    errorMessage.includes('play() failed') ||
    errorMessage.includes('AbortError')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Suppress unhandled promise rejections from extensions and harmless errors
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  const errorString = String(event.reason || '');
  
  // Suppress extension-related errors
  if (
    errorMessage.includes('message channel closed') ||
    errorMessage.includes('asynchronous response') ||
    errorMessage.includes('listener indicated') ||
    errorMessage.includes('Extension context invalidated') ||
    errorMessage.includes('chrome-extension://') ||
    errorMessage.includes('moz-extension://') ||
    errorString.includes('message channel closed') ||
    errorString.includes('asynchronous response')
  ) {
    event.preventDefault();
    return false;
  }
  
  // Suppress audio/video playback errors
  if (
    errorMessage.includes('play() request was interrupted') ||
    errorMessage.includes('play() failed') ||
    errorMessage.includes('AbortError')
  ) {
    event.preventDefault();
    return false;
  }
});

// Suppress audio/video autoplay errors globally
const originalPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function() {
  return originalPlay.call(this).catch(error => {
    // Suppress autoplay policy errors
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
      return Promise.resolve();
    }
    throw error;
  });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Protected Routes - Require Authentication */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sessions" 
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/export" 
          element={
            <ProtectedRoute>
              <ExportPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public Routes - No Authentication Required */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

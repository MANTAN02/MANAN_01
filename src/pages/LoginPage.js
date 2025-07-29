import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import '../styles.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { login, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      showToast('Welcome back! 🎉', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setDebugInfo('Starting Google sign-in...');
    
    try {
      console.log('Attempting Google sign-in...');
      setDebugInfo('Attempting Google sign-in...');
      
      await signInWithGoogle();
      showToast('Welcome to Swapin! 🚀', 'success');
      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setDebugInfo(`Error: ${error.message}`);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    
    const hasPlaceholders = Object.values(config).some(value => 
      value && (value.includes('111111111111111111111') || value === 'your_actual_api_key_here')
    );
    
    if (hasPlaceholders) {
      setDebugInfo('⚠️ Firebase config has placeholder values. Please update with real Firebase credentials.');
      showToast('Firebase config needs real credentials!', 'warning');
    } else {
      setDebugInfo('✅ Firebase config appears to be properly configured.');
      showToast('Firebase config looks good!', 'success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🔄</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Welcome to Swapin
          </h1>
          <p className="text-gray-600">Sign in to start swapping amazing items!</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full button primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Signing In...
                </div>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full button secondary text-lg py-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">🔍</span>
              Continue with Google
            </div>
          </button>

          {/* Debug Section */}
          <div className="mb-6">
            <button
              onClick={checkFirebaseConfig}
              className="w-full button accent text-sm py-2 mb-3"
            >
              🔧 Check Firebase Config
            </button>
            
            {debugInfo && (
              <div className="p-3 bg-gray-100 rounded-lg text-sm">
                <strong>Debug Info:</strong> {debugInfo}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="text-center space-y-3">
            <Link
              to="/signup"
              className="block text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-200"
            >
              🆕 Don't have an account? Sign up
            </Link>
            <button
              onClick={() => showToast('Password reset feature coming soon!', 'info')}
              className="block text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              🔑 Forgot your password?
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-violet-200">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm font-semibold text-gray-700">Easy Swapping</div>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">🚚</div>
            <div className="text-sm font-semibold text-gray-700">Fast Delivery</div>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-sm font-semibold text-gray-700">Secure Payments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

const GoogleLoginDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setDebugInfo('Starting Google login...');
    
    try {
      console.log('Attempting Google login...');
      setDebugInfo('Attempting Google login...');
      
      const result = await signInWithGoogle();
      
      console.log('Google login successful:', result);
      setDebugInfo('Google login successful! User: ' + result.user.email);
      showToast('Google login successful! 🎉', 'success');
      
    } catch (error) {
      console.error('Google login failed:', error);
      setDebugInfo(`Google login failed: ${error.message} (Code: ${error.code})`);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
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
      value && value.includes('111111111111111111111')
    );
    
    if (hasPlaceholders) {
      setDebugInfo('⚠️ Firebase config has placeholder values. Please update with real Firebase credentials.');
    } else {
      setDebugInfo('✅ Firebase config appears to be properly configured.');
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Google Login Debug</h3>
      
      <div className="space-y-4">
        <button
          onClick={checkFirebaseConfig}
          className="button secondary w-full"
        >
          🔍 Check Firebase Config
        </button>
        
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="button primary w-full disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner mr-2"></div>
              Testing Google Login...
            </div>
          ) : (
            '🧪 Test Google Login'
          )}
        </button>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Debug Info:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Troubleshooting Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check if popups are blocked in your browser</li>
            <li>• Ensure you're using HTTPS or localhost</li>
            <li>• Verify Firebase project has Google Auth enabled</li>
            <li>• Check if domain is authorized in Firebase Console</li>
            <li>• Ensure Firebase config has real values (not placeholders)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginDebug; 
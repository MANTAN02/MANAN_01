import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Reusable function for backend calls
export async function callBackendFunction(functionName, method = 'POST', data = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');
  const idToken = await user.getIdToken();
  const response = await fetch(
    `https://us-central1-swapin-b4770.cloudfunctions.net/${functionName}`,
    {
      method,
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined
    }
  );
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful:", result.user);
      
      // Call backend to create user profile
      try {
        await callBackendFunction('createUserProfile', 'POST', {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid
        });
        console.log("User profile created/updated successfully");
      } catch (error) {
        console.error("Error creating user profile:", error);
        // Don't throw error here as login was successful
      }
      
      return result;
    } catch (error) {
      console.error("Google login error:", error);
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by browser. Please allow popups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google login. Please contact support.');
      } else {
        throw new Error('Google login failed. Please try again.');
      }
    }
  };

  // Keep the old method name for backward compatibility
  const googleLogin = signInWithGoogle;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
    signInWithGoogle,
    googleLogin, // Keep for backward compatibility
    callBackendFunction
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
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

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google login successful:", result.user);
      
      // Call backend to create user profile
      try {
        await callBackendFunction('createUserProfile', 'POST', {});
        console.log("User profile created/updated successfully");
      } catch (error) {
        console.error("Error creating user profile:", error);
        // Don't throw error here as login was successful
      }
      
      return result;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

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
    googleLogin,
    callBackendFunction
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
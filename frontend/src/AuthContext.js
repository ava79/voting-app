// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebaseConfig'; // Assuming auth is exported from firebaseConfig.js
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        console.log("AuthContext: User signed in:", user.uid);
      } else {
        console.log("AuthContext: User signed out.");
      }
    }, error => {
      console.error("AuthContext: onAuthStateChanged error:", error);
      setCurrentUser(null); // Ensure user is null on error
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const logout = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading, // Expose loading state if needed by components
    logout
    // You can add login and signup functions here if you prefer them in context
    // but for this exercise, they are directly in Login.js and Register.js
  };

  // Only render children if not loading and Firebase auth has been determined
  // This prevents rendering protected content prematurely or flashing login forms
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Fetch user data from Firestore
        const result = await AuthService.getUserData(firebaseUser.uid);
        if (result.success) {
          setUserData(result.userData);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const result = await AuthService.signInWithEmailAndPassword(email, password);

    // If login successful, the auth state change will handle user data refresh
    if (result.success && result.userData) {
      setUserData(result.userData);
    }

    setLoading(false);
    return result;
  };

  const register = async (email, password, additionalData) => {
    setLoading(true);
    const result = await AuthService.createUserWithEmailAndPassword(email, password, additionalData);

    // After successful registration, set user data
    if (result.success && result.userData) {
      setUserData(result.userData);
    }

    setLoading(false);
    return result;
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    const result = await AuthService.signInWithGoogle();

    // If login successful, update user data
    if (result.success && result.userData) {
      setUserData(result.userData);
    }

    setLoading(false);
    return result;
  };

  const loginWithApple = async () => {
    setLoading(true);
    const result = await AuthService.signInWithApple();

    // If login successful, update user data
    if (result.success && result.userData) {
      setUserData(result.userData);
    }

    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    const result = await AuthService.signOut();
    setLoading(false);
    return result;
  };

  const sendPasswordReset = async (email) => {
    return await AuthService.sendPasswordResetEmail(email);
  };

  const updateProfile = async (newUserData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    const result = await AuthService.updateUserProfile(user.uid, newUserData);
    if (result.success) {
      setUserData(prevData => ({ ...prevData, ...newUserData }));
    }
    return result;
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    const result = await AuthService.getUserData(user.uid);
    if (result.success) {
      setUserData(result.userData);
    }
  };

  const value = {
    user,
    userData,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    logout,
    sendPasswordReset,
    updateProfile,
    refreshUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

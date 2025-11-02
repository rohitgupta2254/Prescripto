import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('prescripto_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await authAPI.validateToken(token);
      // Server returns { success: true, data: { ...user } }
      // We need to set the actual user object (response.data.data)
      setCurrentUser(response.data.data);
      setError('');
    } catch (err) {
      console.error('Token validation failed:', err);
      localStorage.removeItem('prescripto_token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      setCurrentUser(userData);
      localStorage.setItem('prescripto_token', userData.token);
      setError('');
      return { success: true };
    } catch (err) {
      setError('Login failed');
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prescripto_token');
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    currentUser,
    login,
    logout,
    error,
    clearError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
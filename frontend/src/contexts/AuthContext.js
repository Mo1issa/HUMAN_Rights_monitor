import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header for all requests
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      // Set token in axios defaults
      localStorage.setItem('token', token);
      
      // Get user info
      const response = await authAPI.getCurrentUser();
      setCurrentUser({
        token,
        ...response.data
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching current user:", err);
      // If token is invalid, remove it
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ username, password });
      const { access_token } = response.data;
      
      // Fetch user data with the token
      await fetchCurrentUser(access_token);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await authAPI.register(userData);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

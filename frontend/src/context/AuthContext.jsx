import React, { createContext, useState, useEffect, useContext } from 'react';
import client, { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const clearToast = () => setToast(null);

  // Attempt to fetch user profile on initial load
  const loadUser = async () => {
    try {
      // First attempt to get access token by hitting refresh
      // (This works if the user has a valid HttpOnly refresh cookie)
      const refreshResponse = await client.post('/api/v1/auth/refresh');
      if (refreshResponse.data?.success && refreshResponse.data.data.accessToken) {
        const { user: userData, accessToken } = refreshResponse.data.data;
        setAccessToken(accessToken);
        setUser(userData);
        showToast(`Welcome back, ${userData.name}!`, 'success');
      }
    } catch (error) {
      // Ignore initial load failure (user is not logged in)
      console.log('No active session found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for session expiry event from Axios client
    const handleAuthExpired = () => {
      setUser(null);
      setAccessToken(null);
      showToast('Your session has expired. Please log in again.', 'error');
    };

    window.addEventListener('auth_expired', handleAuthExpired);
    return () => window.removeEventListener('auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await client.post('/api/v1/auth/login', { email, password });
      const { user: userData, accessToken } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
      showToast('Logged in successfully!', 'success');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await client.post('/api/v1/auth/register', { name, email, password });
      const { user: userData, accessToken } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
      showToast('Account created successfully!', 'success');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await client.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      showToast('Logged out successfully.', 'success');
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    toast,
    showToast,
    clearToast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendOtp, verifyOtp, getUserProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const userData = await getUserProfile();
          setUser(userData.data.user);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // If the error is due to deactivated account, keep token and mark user as inactive
          const status = error.response?.status;
          const msg = error.response?.data?.message || '';
          if (status === 401 && msg.includes('deactivated')) {
            // Keep token but mark user as inactive so app can redirect to profile completion
            setUser({ isActive: false });
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (phone, otp) => {
    try {
      const response = await verifyOtp(phone, otp);

      // normalize possible response shapes:
      // 1) { token, user }
      // 2) { status, data: { token, user } }
      // 3) verify helper may have already written token to localStorage
      // Support token in several places, including nested tokens.access.token
      let authToken = response?.token
        || response?.data?.token
        || response?.data?.data?.token
        || response?.tokens?.access?.token
        || response?.data?.tokens?.access?.token
        || response?.data?.data?.tokens?.access?.token;

      let userData = response?.user || response?.data?.user || response?.data?.data?.user;

      // fallback to token already in localStorage (e.g. auth.service wrote it)
      if (!authToken) {
        authToken = localStorage.getItem('token');
      }

      // if user data missing but token present, fetch profile
      if (!userData && authToken) {
        try {
          const profileResp = await getUserProfile();
          userData = profileResp?.data?.user || profileResp?.user || profileResp?.data;
        } catch (err) {
          console.warn('Failed to fetch profile after login:', err);
        }
      }

      if (!authToken) {
        throw new Error('No authentication token received from server');
      }

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData || null);

  toast.success('Login successful!');
  return { success: true, user: userData || null };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const sendOtpCode = async (phone) => {
    try {
      await sendOtp(phone);
      toast.success('OTP sent successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    sendOtpCode,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
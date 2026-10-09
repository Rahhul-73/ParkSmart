/**
 * Auth Context  (PO5 — Modern Tool Usage: React Context API)
 *
 * Provides authentication state, login/register/logout actions,
 * and auto-restores session from localStorage.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── Restore session on mount ───
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.data.user);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ─── Login ───
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      setUser(data.data.user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  }, []);

  // ─── Register ───
  const register = useCallback(async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('accessToken', data.data.accessToken);
      setUser(data.data.user);
      setIsAuthenticated(true);
      toast.success('Account created successfully! 🎉');
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  }, []);

  // ─── Logout ───
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue even if API call fails
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out');
  }, []);

  // ─── Update user state ───
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

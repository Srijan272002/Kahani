import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types/api.types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const login = useCallback(async (token: string) => {
    try {
      // Set the token in the API service
      api.setToken(token);

      // Get user data
      const response = await api.get<{ data: { user: User } }>('/api/auth/me');
      setUser(response.data.data.user);

      // Store token in localStorage
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data and token regardless of logout API success
      setUser(null);
      api.clearToken();
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  // Check for existing token and fetch user data on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.setToken(token);
          const response = await api.get<{ data: { user: User } }>('/api/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          api.clearToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 
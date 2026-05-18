import React, { createContext, useState, useEffect, useCallback } from 'react';
import { UserResponse, AuthState } from '../types';
import { getMe, getStoredToken, clearStoredToken, login as apiLogin, register as apiRegister } from '../config/api';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(!!getStoredToken());

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);
    getMe()
      .then(setUser)
      .catch(logout)
      .finally(() => setIsLoading(false));
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
  };

  const register = async (email: string, password: string, full_name?: string) => {
    await apiRegister(email, password, full_name);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isLoading, login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

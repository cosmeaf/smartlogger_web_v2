import React, { createContext, useState, useEffect } from 'react';
import { loginService, verifyToken, blacklistToken } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      const access = localStorage.getItem('access');
      const savedUser = localStorage.getItem('user');

      if (access && savedUser) {
        try {
          await verifyToken(access);
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    initializeSession();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await loginService(email, password);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        await blacklistToken(refresh);
      }
    } catch (err) {
      console.error('Erro ao encerrar a sessão:', err.message);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { loginService, verifyToken, blacklistToken } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para obter dados do storage baseado na preferência "lembrar de mim"
  const getStorageData = (key) => {
    // Primeiro tenta localStorage (remember me), depois sessionStorage
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  };

  // Função para salvar dados no storage baseado na preferência "lembrar de mim"
  const setStorageData = (key, value, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem(key, value);
      // Remove do sessionStorage se existir
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      // Remove do localStorage se existir
      localStorage.removeItem(key);
    }
  };

  // Função para limpar dados de ambos os storages
  const clearStorageData = (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  };

  const verifyAndSetUser = async () => {
    const access = getStorageData('access');
    const savedUser = getStorageData('user');

    if (access && savedUser) {
      try {
        await verifyToken(access);
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Token válido, usuário autenticado:', userData.email);
      } catch (err) {
        console.error('Token inválido ou expirado:', err);
        // Limpa todos os dados se o token for inválido
        clearStorageData('user');
        clearStorageData('access');
        clearStorageData('refresh');
        clearStorageData('rememberMe');
        setUser(null);
      }
    } else {
      console.log('Nenhum token ou usuário encontrado no storage');
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyAndSetUser();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Tentando fazer login para:', email, 'Remember me:', rememberMe);
      
      const data = await loginService(email, password);
      
      // Verifica se os dados essenciais estão presentes
      if (!data || !data.user || !data.access) {
        throw new Error('Dados de login incompletos recebidos do servidor');
      }
      
      console.log('Login bem-sucedido, dados recebidos:', { 
        user: data.user?.email || 'N/A', 
        hasAccess: !!data.access, 
        hasRefresh: !!data.refresh 
      });

      // Salva os dados no storage apropriado baseado na opção "lembrar de mim"
      setStorageData('user', JSON.stringify(data.user), rememberMe);
      setStorageData('access', data.access, rememberMe);
      setStorageData('refresh', data.refresh, rememberMe);
      setStorageData('rememberMe', rememberMe.toString(), rememberMe);
      
      setUser(data.user);
      setLoading(false);
      
      console.log('Estado do usuário atualizado com sucesso');
      return true;
    } catch (err) {
      console.error('Erro durante o login:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao fazer login';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refresh = getStorageData('refresh');
      if (refresh) {
        await blacklistToken(refresh);
        console.log('Token invalidado no servidor');
      }
    } catch (err) {
      console.error('Erro ao encerrar a sessão no servidor:', err.message);
    } finally {
      // Limpa todos os dados de ambos os storages
      clearStorageData('user');
      clearStorageData('access');
      clearStorageData('refresh');
      clearStorageData('rememberMe');
      setUser(null);
      console.log('Logout realizado, dados limpos');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

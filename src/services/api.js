// src/services/api.js
import axios from 'axios';

const API_URL = 'https://api.smartlogger.io/api/';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status >= 500) {
        throw new Error('[500] Servidor temporariamente indisponível.');
      } else if (status === 401) {
        throw new Error('[401] Credenciais inválidas. Verifique seu login.');
      } else if (status === 400) {
        throw new Error(`[400] ${data.detail || 'Requisição inválida.'}`);
      } else {
        throw new Error(`[${status}] ${data.detail || 'Erro inesperado.'}`);
      }
    } else if (error.request) {
      throw new Error('SISTEMA TEMPORARIAMENTE INDISPONÍVEL. Verifique sua conexão.');
    } else {
      throw new Error('Erro inesperado. Tente novamente mais tarde.');
    }
  }
);

export default api;

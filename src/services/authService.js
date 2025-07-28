// src/services/authService.js
import apiService from './apiService';

export const loginService = async (email, password) => {
  try {
    const response = await apiService.post('login/', { email, password });
    
    // Verifica se a resposta tem os dados necessários
    if (!response.data || !response.data.user || !response.data.access) {
      throw new Error('Resposta inválida do servidor');
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro no loginService:', error);
    
    // Melhora o tratamento de diferentes tipos de erro
    if (error.response) {
      // Erro de resposta do servidor (4xx, 5xx)
      const message = error.response.data?.message || 
                     error.response.data?.detail || 
                     error.response.data?.non_field_errors?.[0] ||
                     `Erro do servidor: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      throw new Error(error.message || 'Erro desconhecido');
    }
  }
};

export const registerService = (data) => {
  return apiService.post('register/', data);
};

export const recoveryService = (email) => {
  return apiService.post('recovery/', { email });
};

export const verifyToken = (token) => {
  return apiService.post('verify/', { token });
};

export const blacklistToken = (refresh) => {
  return apiService.post('blacklist/', { refresh });
};

export const refreshTokenService = (refresh) => {
  return apiService.post('refresh/', { refresh });
};

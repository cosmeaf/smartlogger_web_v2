// src/services/authService.js
import apiService from './apiService';

export const loginService = async (email, password) => {
  try {
    const response = await apiService.post('login/', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
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

// src/services/protectedService.js
import apiService from './apiService';

export const getProtectedData = () => {
  return apiService.get('protected-endpoint/');
};

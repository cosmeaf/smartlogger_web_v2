// src/services/apiService.js
import api from './api';

const apiService = {
  post(url, data) {
    return api.post(url, data);
  },
  get(url, params = {}) {
    return api.get(url, { params });
  },
  put(url, data) {
    return api.put(url, data);
  },
  patch(url, data) {
    return api.patch(url, data);
  },
  delete(url) {
    return api.delete(url);
  },
};

export default apiService;

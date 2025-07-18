// src/services/api.js
import axios from 'axios';
import { refreshTokenService, blacklistToken } from './authService';

//const API_URL = 'https://api.smartlogger.io/api/';
const API_URL = 'https://api.smartlogger.com.br/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (!originalRequest._retry && error.response && error.response.status === 401) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        // Sem token de refresh, deslogar
        localStorage.clear();
        //window.location.href = '/login'; // Redirecionar para a página de login
        window.location.href = '/'; // Redirecionar para a página de login
        return Promise.reject(error);
      }

      return new Promise(function (resolve, reject) {
        refreshTokenService(refresh)
          .then(({ access }) => {
            localStorage.setItem('access', access);
            api.defaults.headers['Authorization'] = 'Bearer ' + access;
            originalRequest.headers['Authorization'] = 'Bearer ' + access;
            processQueue(null, access);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            blacklistToken(refresh) // Opcional: invalidar o refresh token no backend
              .then(() => {
                localStorage.clear();
                window.location.href = '/login'; // Redirecionar para a página de login
              });
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;

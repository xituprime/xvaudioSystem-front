import axios from 'axios';

// En desarrollo usar '/api' para que el proxy de Vite evite CORS
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: añadir token a todas las peticiones privadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: manejo centralizado 401 y 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        window.location.href = '/login';
      }
      if (status === 403) {
        window.dispatchEvent(new Event('auth:forbidden'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

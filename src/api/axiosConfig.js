import axios from 'axios';

// En desarrollo usar '/api' para que el proxy de Vite evite CORS
const API_URL = import.meta.env.VITE_API_URL || '/api';

/** Verifica si el JWT está expirado (claim exp en segundos). Si no es JWT o no tiene exp, no expira por este check. */
function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp == null) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return false;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth:logout'));
  window.location.href = '/login';
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: token válido (no expirado) y añadir a peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        clearAuthAndRedirect();
        return Promise.reject(new Error('Token expirado'));
      }
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
        clearAuthAndRedirect();
      }
      if (status === 403) {
        window.dispatchEvent(new Event('auth:forbidden'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

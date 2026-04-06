import axios from 'axios';

// En desarrollo usar '/api' para que el proxy de Vite evite CORS
const API_URL = import.meta.env.VITE_API_URL || '/api';

function isAuthRoute(url) {
  if (!url) return false;
  const u = String(url);
  return (
    u.includes('/auth/login') ||
    u.includes('/auth/register') ||
    u.includes('/auth/verify-email') ||
    u.includes('/auth/resend-verification')
  );
}

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

function notifySessionExpired() {
  localStorage.removeItem('token');
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
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
        notifySessionExpired();
        return Promise.reject(new Error('Token expirado'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: 401 → modal re-login (no redirección dura); no aplica a login/register
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        const url = error.config?.url || '';
        if (!isAuthRoute(url)) {
          notifySessionExpired();
        }
      }
      if (status === 403) {
        window.dispatchEvent(new Event('auth:forbidden'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Determine backend base URL:
// 1. If VITE_API_BASE_URL is set in environment, use it.
// 2. If running in production on the same host (fullstack service), use window.location.origin.
// 3. Otherwise (local dev default), use http://localhost:5000.
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    let url = import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://agri-equip-backend.onrender.com';
  }
  return 'http://localhost:5000';
};

export const BACKEND_URL = getBackendUrl();

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Request interceptor: attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle banned account 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || '';
      if (msg.toLowerCase().includes('banned')) {
        localStorage.removeItem('token');
        alert('Your account has been banned. Please contact support.');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

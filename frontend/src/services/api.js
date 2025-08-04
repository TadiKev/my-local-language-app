import axios from 'axios';

const getBaseURL = () => {
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && window.location.hostname === 'localhost';

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (isLocalhost) {
    return 'http://localhost:5000/api';
  }

  // Fallback (in case nothing else is set)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // For cookie/session auth if used
});

// Attach token from localStorage to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;

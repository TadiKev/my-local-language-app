// frontend/src/services/api.js

import axios from 'axios';

const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  // Use env var if set, else localhost
  const raw = envURL || 'http://localhost:5000';
  // Remove any trailing slash
  const clean = raw.replace(/\/$/, '');
  // Ensure it ends with /api
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
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

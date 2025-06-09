// src/features/auth/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Register a new user  ← changed from '/auth/signup' to '/auth/register'
export async function register({ name, email, password, preferredLanguage }) {
  const response = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
    preferredLanguage, // don’t forget this field if you care about it
  });
  return response.data; // { user, token }
}

// Login existing user
export async function login({ email, password }) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data; // { user, token }
}

// (Optional) Remove or update these if you don’t have matching backend routes yet
export async function forgotPassword({ email }) {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
}

export async function resetPassword({ token, newPassword }) {
  const response = await axios.post(`${API_URL}/auth/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
}

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
};

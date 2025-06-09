// frontend/src/features/auth/authService.js

import api from '../../services/api';

// Register a new user
export async function register({ name, email, password, preferredLanguage }) {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    preferredLanguage,
  });
  return response.data; // { user, token }
}

// Login existing user
export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { user, token }
}

export default { register, login };

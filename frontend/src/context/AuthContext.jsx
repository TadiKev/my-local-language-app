// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // our preconfigured Axios instance

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Whenever token changes, persist to localStorage (so api interceptor picks it up)
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const register = async (data) => {
    // Expect authService.register to POST to /api/auth/register and return { user, token }
    const { user: newUser, token: newToken } = await api.post('/auth/register', data).then(res => res.data);
    setUser(newUser);
    setToken(newToken);
    return newUser;
  };

  const login = async (data) => {
    // Expect authService.login to POST to /api/auth/login and return { user, token }
    const { user: loggedUser, token: authToken } = await api.post('/auth/login', data).then(res => res.data);
    setUser(loggedUser);
    setToken(authToken);
    return loggedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // localStorage cleanup happens via effect
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

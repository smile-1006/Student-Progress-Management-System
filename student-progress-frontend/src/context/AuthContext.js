import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    student: null
  });

  useEffect(() => {
    const loadStudent = async () => {
      if (localStorage.token) {
        try {
          const res = await api.auth.getProfile();
          setAuth({
            ...auth,
            isAuthenticated: true,
            loading: false,
            student: res.data
          });
        } catch (err) {
          localStorage.removeItem('token');
          setAuth({
            ...auth,
            token: null,
            isAuthenticated: false,
            loading: false
          });
        }
      } else {
        setAuth({
          ...auth,
          isAuthenticated: false,
          loading: false
        });
      }
    };

    loadStudent();
  }, []);

  // Register student
  const register = async (formData) => {
    try {
      const res = await api.auth.register(formData);
      localStorage.setItem('token', res.data.token);
      setAuth({
        ...auth,
        token: res.data.token,
        isAuthenticated: true,
        loading: false
      });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Login student
  const login = async (formData) => {
    try {
      const res = await api.auth.login(formData);
      localStorage.setItem('token', res.data.token);
      setAuth({
        ...auth,
        token: res.data.token,
        isAuthenticated: true,
        loading: false
      });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Logout student
  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      ...auth,
      token: null,
      isAuthenticated: false,
      loading: false,
      student: null
    });
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
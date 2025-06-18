import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
        setAuthToken(localStorage.token);
        try {
          const res = await axios.get('/api/students/profile');
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
            loading: false,
            student: null
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

  // Set auth token in headers
  const setAuthToken = token => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Register student
  const register = async formData => {
    try {
      const res = await axios.post('/api/students/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      setAuth({
        ...auth,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        student: res.data.student
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data.message };
    }
  };

  // Login student
  const login = async formData => {
    try {
      const res = await axios.post('/api/students/login', formData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      setAuth({
        ...auth,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        student: res.data.student
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data.message };
    }
  };

  // Logout
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
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);
  
  if (auth.loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
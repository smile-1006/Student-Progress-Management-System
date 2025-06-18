import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Landing = () => {
  const { auth } = useContext(AuthContext);

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="landing flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Student Progress Management System</h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your academic progress, manage assignments, and stay on top of your coursework with our comprehensive student progress tracking system.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-blue-600 text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
          <p className="text-gray-600">
            Visualize your academic progress with intuitive charts and analytics.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-blue-600 text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Manage Assignments</h3>
          <p className="text-gray-600">
            Keep track of all your assignments, due dates, and submission status.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-blue-600 text-4xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold mb-2">Course Management</h3>
          <p className="text-gray-600">
            Enroll in courses and access all course materials in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
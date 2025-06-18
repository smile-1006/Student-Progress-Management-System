import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import AssignmentDetail from './components/assignments/AssignmentDetail';
import ProgressReport from './components/progress/ProgressReport';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute>
                  <CourseList />
                </PrivateRoute>
              } />
              <Route path="/courses/:id" element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              } />
              <Route path="/assignments/:id" element={
                <PrivateRoute>
                  <AssignmentDetail />
                </PrivateRoute>
              } />
              <Route path="/progress" element={
                <PrivateRoute>
                  <ProgressReport />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>Student Progress Management System &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);

  const authLinks = (
    <ul className="flex space-x-4">
      <li>
        <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
      </li>
      <li>
        <Link to="/courses" className="text-white hover:text-gray-300">Courses</Link>
      </li>
      <li>
        <Link to="/progress" className="text-white hover:text-gray-300">Progress</Link>
      </li>
      <li>
        <button onClick={logout} className="text-white hover:text-gray-300">Logout</button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="flex space-x-4">
      <li>
        <Link to="/register" className="text-white hover:text-gray-300">Register</Link>
      </li>
      <li>
        <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
      </li>
    </ul>
  );

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">Student Progress Tracker</Link>
        <div>
          {!auth.loading && (auth.isAuthenticated ? authLinks : guestLinks)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
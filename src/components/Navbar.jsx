import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Navbar.css'

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
  <nav className="nav-root">
    <div className="nav-container">
      <Link className="nav-brand" to="/">Temple Management</Link>
      <button className="nav-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="nav-toggle-icon"></span>
      </button>
      <div className="nav-collapse">
        {isLoggedIn && (
          <ul className="nav-links-left">
            <li><Link className="nav-link" to="/">Dashboard</Link></li>
            <li><Link className="nav-link" to="/donations">Donations</Link></li>
            <li><Link className="nav-link" to="/poojas">Poojas</Link></li>
            <li><Link className="nav-link" to="/AllPoojas">All Poojas</Link></li>
            <li><Link className="nav-link" to="/devotees">Devotees</Link></li>
            <li><Link className="nav-link" to="/staff">Staff</Link></li>
            <li><Link className="nav-link" to="/expenses">Expenses</Link></li>
          </ul>
        )}
        <ul className="nav-links-right">
          {isLoggedIn ? (
            <li>
              <button className="nav-button" onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <li>
              <Link className="nav-button" to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;

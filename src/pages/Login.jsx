import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      Swal.fire('Success', 'Logged in successfully', 'success');
      navigate('/');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || 'Login failed', 'error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-heading">Welcome Back</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="form-button" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

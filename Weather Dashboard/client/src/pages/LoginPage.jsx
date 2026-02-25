// client/src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { WiDaySunny } from 'react-icons/wi';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const user = { email, password };

    try {
      const res = await axios.post('/api/auth/login', user);
      if (res.data.token) {
        login(res.data.token);
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page animate-fade">
      <div className="auth-form-container glass-card">
        <div className="auth-header">
          <WiDaySunny size={64} color="#6366f1" className="animate-pulse-slow" />
          <h1 className="brand-logo">SkyCast</h1>
          <p className="auth-subtitle">Login to your dashboard</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {error && <div className="error-badge">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              className="search-input"
              value={email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="search-input"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <button type="submit" className="search-button auth-submit">
            Continue
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
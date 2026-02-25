// client/src/pages/RegisterPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { WiDaySunny } from 'react-icons/wi';

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newUser = { email, password };

    try {
      await axios.post('/api/auth/register', newUser);
      setSuccess('Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
          <WiDaySunny size={64} color="#ec4899" className="animate-pulse-slow" />
          <h1 className="brand-logo" style={{ background: 'linear-gradient(to right, #fff, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SkyCast
          </h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {error && <div className="error-badge">{error}</div>}
          {success && <div className="success-badge">{success}</div>}

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
              placeholder="Choose a strong password"
              className="search-input"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <button type="submit" className="search-button auth-submit" style={{ background: 'var(--secondary)' }}>
            Join SkyCast
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
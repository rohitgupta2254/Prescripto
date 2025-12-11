import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/Patient.css';

const PatientLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/patient/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.loginPatient(formData);
      await login(response.data.data);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Patient Login</h1>
            <p>Welcome back! Please sign in to your account.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-large btn-full btn-no-shift"
            >
              <span className="btn-label" style={{ visibility: loading ? 'hidden' : 'visible' }}>Sign In</span>
              {loading && (
                <div className="btn-spinner">
                  <LoadingSpinner size="small" text="" />
                </div>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/patient/register" className="auth-link">
                Register here
              </Link>
            </p>
            <p>
              Are you a doctor?{' '}
              <Link to="/doctor/login" className="auth-link">
                Doctor login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
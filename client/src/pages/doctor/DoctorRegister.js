import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { SPECIALIZATIONS } from '../../utils/constants';
import { validateDoctorRegistration } from '../../utils/validation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/Doctor.css';

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    fees: '',
    address: '',
    phone: '',
    experience_years: '',
    qualifications: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/doctor/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateDoctorRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.registerDoctor(formData);
      await login(response.data.data);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Doctor Registration</h1>
            <p>Create your professional account to start accepting appointments.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a password (min. 6 characters)"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`form-select ${errors.specialization ? 'error' : ''}`}
                >
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <span className="field-error">{errors.specialization}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Fee ($) *</label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className={`form-input ${errors.fees ? 'error' : ''}`}
                  placeholder="e.g., 50"
                  min="0"
                  step="0.01"
                />
                {errors.fees && <span className="field-error">{errors.fees}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinic Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-textarea ${errors.address ? 'error' : ''}`}
                placeholder="Enter your clinic address"
                rows="3"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., MD, MBBS"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-large btn-full"
            >
              {loading ? <LoadingSpinner size="small" text="" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/doctor/login" className="auth-link">
                Sign in here
              </Link>
            </p>
            <p>
              Are you a patient?{' '}
              <Link to="/patient/register" className="auth-link">
                Patient registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
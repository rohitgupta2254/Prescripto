import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { SPECIALIZATIONS } from '../../utils/constants';
import { validateProfile } from '../../utils/validation';
import '../../styles/Doctor.css';

const DoctorProfileForm = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    fees: '',
    address: '',
    phone: '',
    experience_years: '',
    qualifications: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getProfile();
      const profile = response.data.data;
      setFormData({
        name: profile.name || '',
        specialization: profile.specialization || '',
        fees: profile.fees || '',
        address: profile.address || '',
        phone: profile.phone || '',
        experience_years: profile.experience_years || '',
        qualifications: profile.qualifications || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateProfile(formData, 'doctor');
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await doctorAPI.updateProfile(formData);
      setSuccess('Profile updated successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form">
      <h2>Doctor Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
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
        </div>

        <div className="form-row">
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
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
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

        <div className="form-group">
          <label className="form-label">Qualifications</label>
          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Enter your qualifications and certifications"
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary btn-large"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfileForm;
import React, { useState } from 'react';
import { doctorAPI } from '../../services/api';
import '../../styles/Doctor.css';

const ConsultationModal = ({ appointment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    medicines: '',
    notes: '',
    followUpDays: '',
    followUpReason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.medicines.trim()) {
        setError('Please enter prescription details');
        setLoading(false);
        return;
      }

      const payload = {
        medicines: formData.medicines.trim(),
        notes: formData.notes.trim(),
        followUpDays: formData.followUpDays ? parseInt(formData.followUpDays) : null,
        followUpReason: formData.followUpReason.trim()
      };

      await doctorAPI.completeAppointmentWithDetails(appointment.id, payload);

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save consultation details');
    } finally {
      setLoading(false);
    }
  };

  const calculateFollowUpDate = () => {
    if (!formData.followUpDays) return null;
    const date = new Date();
    date.setDate(date.getDate() + parseInt(formData.followUpDays));
    return date.toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content consultation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Appointment - Add Consultation Details</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Patient Info */}
            <div className="info-section">
              <h4>Patient: {appointment.patient_name}</h4>
              <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
              <p>Time: {appointment.appointment_time}</p>
            </div>

            {/* Medicines Section */}
            <div className="form-group">
              <label htmlFor="medicines">
                <strong>Prescribed Medicines</strong>
                <span className="required">*</span>
              </label>
              <textarea
                id="medicines"
                name="medicines"
                value={formData.medicines}
                onChange={handleChange}
                placeholder="Enter medicines prescribed to patient (one per line)&#10;Example:&#10;Aspirin - 500mg, 2 times daily&#10;Vitamin B12 - 1000mcg, once daily"
                rows={4}
                className="form-control"
              />
              <small>Separate each medicine with a new line</small>
            </div>

            {/* Notes Section */}
            <div className="form-group">
              <label htmlFor="notes">
                <strong>Doctor's Notes</strong>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes for the patient (diet, lifestyle changes, precautions, etc.)"
                rows={3}
                className="form-control"
              />
            </div>

            {/* Follow-up Section */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="followUpDays">
                  <strong>Follow-up After (Days)</strong>
                </label>
                <input
                  type="number"
                  id="followUpDays"
                  name="followUpDays"
                  value={formData.followUpDays}
                  onChange={handleChange}
                  placeholder="e.g., 7, 14, 30"
                  min="1"
                  max="365"
                  className="form-control"
                />
                {formData.followUpDays && (
                  <small className="follow-up-date">
                    Follow-up date: <strong>{calculateFollowUpDate()}</strong>
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="followUpReason">
                  <strong>Follow-up Reason</strong>
                </label>
                <input
                  type="text"
                  id="followUpReason"
                  name="followUpReason"
                  value={formData.followUpReason}
                  onChange={handleChange}
                  placeholder="e.g., Check progress, Review test results"
                  className="form-control"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save & Complete Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;

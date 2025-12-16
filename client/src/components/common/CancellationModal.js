import React, { useState } from 'react';
import { patientAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import '../../styles/Modal.css';

const CancellationModal = ({ appointment, onClose, onSubmitted }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await patientAPI.requestCancellation(appointment.id, { reason });
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request cancellation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Appointment Cancellation</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <h3>✓ Cancellation Request Submitted</h3>
              <p>Your cancellation request has been sent to Dr. {appointment.doctor_name}.</p>
              <p>The doctor will review and approve or reject your request.</p>
              <p>You'll receive an email notification once the doctor responds.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="appointment-info">
                <h4>Appointment Details</h4>
                <p><strong>Doctor:</strong> Dr. {appointment.doctor_name}</p>
                <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
                <p><strong>Time:</strong> {formatTime(appointment.appointment_time)}</p>
                <p><strong>Fee:</strong> ${appointment.fees}</p>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Cancellation *</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why you want to cancel this appointment..."
                  rows="5"
                  disabled={loading}
                  required
                />
              </div>

              <div className="info-box">
                <strong>Note:</strong> Your appointment will be cancelled only after the doctor approves your request. 
                Upon approval, a full refund of ${appointment.fees} will be initiated.
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Request Cancellation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;

import React, { useState } from 'react';
import { doctorAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import '../../styles/Doctor.css';

const AppointmentList = ({ appointments, onUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    setError('');

    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, newStatus);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: 'status-scheduled', text: 'Scheduled' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' },
      no_show: { class: 'status-no-show', text: 'No Show' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <p>No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className="appointment-list">
      {error && <div className="error-message">{error}</div>}
      
      <div className="appointments-grid">
        {appointments.map(appointment => (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-header">
              <h3>{appointment.patient_name}</h3>
              {getStatusBadge(appointment.status)}
            </div>
            
            <div className="appointment-details">
              <div className="detail-item">
                <span className="label">Date:</span>
                <span className="value">{formatDate(appointment.appointment_date)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Time:</span>
                <span className="value">{formatTime(appointment.appointment_time)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{appointment.patient_phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{appointment.patient_email}</span>
              </div>
            </div>

            {appointment.status === 'scheduled' && (
              <div className="appointment-actions">
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                  disabled={updatingId === appointment.id}
                  className="btn btn-success btn-small"
                >
                  {updatingId === appointment.id ? '...' : 'Mark Completed'}
                </button>
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                  disabled={updatingId === appointment.id}
                  className="btn btn-danger btn-small"
                >
                  {updatingId === appointment.id ? '...' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'no_show')}
                  disabled={updatingId === appointment.id}
                  className="btn btn-warning btn-small"
                >
                  {updatingId === appointment.id ? '...' : 'No Show'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;
import React, { useState } from 'react';
import { doctorAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import ConsultationModal from './ConsultationModal';
import '../../styles/Doctor.css';

const AppointmentList = ({ appointments, onUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationDetails, setConsultationDetails] = useState({});

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    setError('');

    try {
      if (newStatus === 'completed') {
        // Open consultation modal instead of directly updating
        setSelectedAppointment(appointments.find(a => a.id === appointmentId));
      } else {
        await doctorAPI.updateAppointmentStatus(appointmentId, newStatus);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConsultationSuccess = () => {
    if (onUpdate) onUpdate();
    setSelectedAppointment(null);
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

  const renderConsultationDetails = (appointment) => {
    const details = consultationDetails[appointment.id] || appointment.consultationDetails || appointment.consultation_details;
    if (!details) return null;

    return (
      <div className="consultation-info">
        <h4>📋 Consultation Details</h4>
        <div className="detail-item">
          <span className="label">Medicines:</span>
          <div className="medicines-list">
            {details.medicines ? details.medicines.split('\n').map((m, i) => (
              <p key={i}>💊 {m}</p>
            )) : <p>No medicines prescribed</p>}
          </div>
        </div>
        {details.notes && (
          <div className="detail-item">
            <span className="label">Notes:</span>
            <span className="value">{details.notes}</span>
          </div>
        )}
        {details.follow_up_date && (
          <div className="detail-item">
            <span className="label">Follow-up:</span>
            <span className="value">{new Date(details.follow_up_date).toLocaleDateString()} ({details.follow_up_days} days) - {details.follow_up_reason || 'Regular check-up'}</span>
          </div>
        )}
      </div>
    );
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

            {appointment.status === 'completed' && renderConsultationDetails(appointment)}

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

      {selectedAppointment && (
        <ConsultationModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={handleConsultationSuccess}
        />
      )}
    </div>
  );
};

export default AppointmentList;
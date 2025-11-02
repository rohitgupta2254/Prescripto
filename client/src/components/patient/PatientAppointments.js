import React, { useState } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { formatDate, formatTime } from '../../utils/helpers';
import ReviewModal from '../common/ReviewModal';
import '../../styles/Patient.css';

const PatientAppointments = () => {
  const [statusFilter, setStatusFilter] = useState('scheduled');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const { 
    appointments, 
    loading, 
    error, 
    cancelAppointment,
    refetch 
  } = useAppointments('patient', statusFilter);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    const result = await cancelAppointment(appointmentId);
    if (result.success) {
      alert('Appointment cancelled successfully');
    } else {
      alert(result.error);
    }
  };

  const handleReview = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    setSelectedAppointment(null);
    refetch();
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

  const canCancel = (appointmentDate, appointmentTime) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const timeDiff = appointmentDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff >= 2; // Can cancel if more than 2 hours before
  };

  const canReview = (appointment) => {
    return appointment.status === 'completed' && !appointment.reviewed;
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="patient-appointments">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('scheduled')}
          >
            Upcoming
          </button>
          <button
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-tab ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
          <button
            className={`filter-tab ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>No {statusFilter || ''} appointments found.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="doctor-info">
                  <h3>Dr. {appointment.doctor_name}</h3>
                  <p className="specialization">{appointment.doctor_specialization}</p>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(appointment.appointment_date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Time:</span>
                    <span className="value">{formatTime(appointment.appointment_time)}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="label">Fee:</span>
                    <span className="value">${appointment.fees}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className="value">
                      {appointment.consultation_type === 'video' ? 'Video Call' : 'In-Person'}
                    </span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="detail-item full-width">
                    <span className="label">Reason:</span>
                    <span className="value">{appointment.symptoms}</span>
                  </div>
                )}

                {appointment.doctor_address && (
                  <div className="detail-item full-width">
                    <span className="label">Address:</span>
                    <span className="value">{appointment.doctor_address}</span>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                {appointment.status === 'scheduled' && (
                  <>
                    {canCancel(appointment.appointment_date, appointment.appointment_time) ? (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn btn-danger"
                      >
                        Cancel Appointment
                      </button>
                    ) : (
                      <span className="cancel-disabled">
                        Cannot cancel within 2 hours of appointment
                      </span>
                    )}
                  </>
                )}

                {canReview(appointment) && (
                  <button
                    onClick={() => handleReview(appointment)}
                    className="btn btn-primary"
                  >
                    Write Review
                  </button>
                )}

                {appointment.status === 'completed' && appointment.reviewed && (
                  <span className="reviewed-badge">Reviewed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showReviewModal && selectedAppointment && (
        <ReviewModal
          appointment={selectedAppointment}
          doctor={{
            id: selectedAppointment.doctor_id,
            name: selectedAppointment.doctor_name
          }}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default PatientAppointments;
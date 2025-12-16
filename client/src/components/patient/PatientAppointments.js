import React, { useState, useEffect } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { doctorAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import ReviewModal from '../common/ReviewModal';
import CancellationModal from '../common/CancellationModal';
import '../../styles/Patient.css';

const PatientAppointments = () => {
  const [statusFilter, setStatusFilter] = useState('scheduled');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationDetails, setConsultationDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  
  const { 
    appointments, 
    loading, 
    error, 
    cancelAppointment,
    refetch 
  } = useAppointments('patient', statusFilter);

  // Load consultation details for completed appointments
  useEffect(() => {
    const loadConsultationDetails = async () => {
      const completedAppointments = appointments.filter(a => a.status === 'completed');
      
      for (const appointment of completedAppointments) {
        if (!consultationDetails[appointment.id]) {
          setLoadingDetails(prev => ({ ...prev, [appointment.id]: true }));
          try {
            const response = await doctorAPI.getConsultationDetails(appointment.id);
            if (response.data.data) {
              setConsultationDetails(prev => ({
                ...prev,
                [appointment.id]: response.data.data
              }));
            }
          } catch (err) {
            console.error(`Failed to load consultation details for appointment ${appointment.id}`);
          } finally {
            setLoadingDetails(prev => ({ ...prev, [appointment.id]: false }));
          }
        }
      }
    };

    if (appointments.length > 0) {
      loadConsultationDetails();
    }
  }, [appointments, consultationDetails]);

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancellationModal(true);
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

  const handleCancellationSubmitted = () => {
    setShowCancellationModal(false);
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
    try {
      // Normalize date format to YYYY-MM-DD
      let dateStr = appointmentDate;
      
      if (dateStr.includes('/')) {
        // Handle DD/MM/YYYY format (if backend returns this way)
        const parts = dateStr.split('/');
        if (parts[2].length === 4) {
          dateStr = `${parts[2]}-${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`;
        }
      } else if (dateStr.includes('-')) {
        // Ensure YYYY-MM-DD format
        const parts = dateStr.split('-');
        if (parts[0].length === 2) {
          // It's DD-MM-YYYY, convert to YYYY-MM-DD
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      // Normalize time format to HH:MM:SS
      let timeStr = appointmentTime || '00:00:00';
      timeStr = String(timeStr).trim();
      
      if (timeStr.length === 5 && timeStr.includes(':')) {
        // Add seconds if not present (HH:MM -> HH:MM:00)
        timeStr = `${timeStr}:00`;
      }
      
      // Create date in local timezone to avoid timezone issues
      const [year, month, day] = dateStr.split('-');
      const [hours, minutes, seconds] = timeStr.split(':');
      
      const appointmentDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds) || 0
      );
      
      const now = new Date();
      const timeDiff = appointmentDateTime - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      console.log('Debug - Appointment:', {
        dateStr,
        timeStr,
        appointmentDateTime: appointmentDateTime.toLocaleString(),
        now: now.toLocaleString(),
        hoursDiff: hoursDiff.toFixed(2)
      });
      
      return hoursDiff >= 2; // Can cancel if more than 2 hours before
    } catch (error) {
      console.error('Error calculating canCancel:', error, { appointmentDate, appointmentTime });
      return false; // Default to not cancellable if there's an error
    }
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

                {appointment.status === 'completed' && consultationDetails[appointment.id] && (
                  <div className="consultation-details-section">
                    <h4>📋 Consultation Details</h4>
                    
                    {consultationDetails[appointment.id].medicines && (
                      <div className="detail-item full-width">
                        <span className="label">Prescribed Medicines:</span>
                        <div className="medicines-list">
                          {consultationDetails[appointment.id].medicines.split('\n').map((medicine, idx) => (
                            <div key={idx} className="medicine-item">
                              💊 {medicine}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {consultationDetails[appointment.id].notes && (
                      <div className="detail-item full-width">
                        <span className="label">Doctor's Notes:</span>
                        <span className="value">{consultationDetails[appointment.id].notes}</span>
                      </div>
                    )}

                    {consultationDetails[appointment.id].follow_up_date && (
                      <div className="detail-item full-width">
                        <span className="label">Follow-up Appointment:</span>
                        <div className="follow-up-section">
                          <p><strong>📅 Date:</strong> {new Date(consultationDetails[appointment.id].follow_up_date).toLocaleDateString()}</p>
                          <p><strong>📆 Days:</strong> {consultationDetails[appointment.id].follow_up_days} days from consultation</p>
                          {consultationDetails[appointment.id].follow_up_reason && (
                            <p><strong>📝 Reason:</strong> {consultationDetails[appointment.id].follow_up_reason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                {appointment.status === 'scheduled' && (
                  <div className="action-group">
                    {canCancel(appointment.appointment_date, appointment.appointment_time) ? (
                      <button
                        onClick={() => handleCancelAppointment(appointment)}
                        className="btn btn-cancel-appointment"
                        title="Cancel this appointment (must be at least 2 hours before appointment time)"
                      >
                        🚫 Cancel Appointment
                      </button>
                    ) : (
                      <div className="cancel-info-badge">
                        <span className="cancel-icon">⏱️</span>
                        <span className="cancel-text">Cannot cancel within 2 hours</span>
                      </div>
                    )}
                  </div>
                )}

                {canReview(appointment) && (
                  <button
                    onClick={() => handleReview(appointment)}
                    className="btn btn-primary"
                  >
                    ⭐ Write Review
                  </button>
                )}

                {appointment.status === 'completed' && appointment.reviewed && (
                  <span className="reviewed-badge">✓ Reviewed</span>
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

      {showCancellationModal && selectedAppointment && (
        <CancellationModal
          appointment={selectedAppointment}
          onClose={() => setShowCancellationModal(false)}
          onSubmitted={handleCancellationSubmitted}
        />
      )}
    </div>
  );
};

export default PatientAppointments;
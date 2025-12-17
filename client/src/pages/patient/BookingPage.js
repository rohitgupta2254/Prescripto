import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import AppointmentBooking from '../../components/patient/AppointmentBooking';
import PaymentForm from '../../components/payment/PaymentForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/Patient.css';

const BookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('booking'); // 'booking', 'payment', 'success'

  useEffect(() => {
    fetchDoctorProfile();
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await patientAPI.getDoctorProfile(doctorId);
      setDoctor(response.data.data);
    } catch (err) {
      setError('Failed to load doctor profile');
      console.error('Doctor profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (appointmentData) => {
    // Store appointment details but don't create it yet
    // appointmentData contains the form data (date, time, symptoms, etc.)
    setAppointment(appointmentData);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigate('/patient/dashboard');
    }, 3000);
  };

  const handlePaymentCancel = () => {
    setStep('booking');
    setAppointment(null);
  };

  if (loading) {
    return <LoadingSpinner text="Loading doctor information..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/patient/doctors')} className="btn btn-primary">
          Back to Doctors
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="error-container">
        <div className="error-message">Doctor not found</div>
        <button onClick={() => navigate('/patient/doctors')} className="btn btn-primary">
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        {step === 'booking' && (
          <AppointmentBooking
            doctor={doctor}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {step === 'payment' && appointment && (
          <div className="payment-step">
            <div className="step-header">
              <h2>Complete Your Booking</h2>
              <p>Please complete the payment to confirm your appointment</p>
            </div>
            <PaymentForm
              appointment={appointment}
              doctor={doctor}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        )}

        {step === 'success' && (
          <div className="success-step">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h2>Appointment Confirmed!</h2>
              <p>Your appointment has been successfully booked and payment has been processed.</p>
              
              {appointment && (
                <div className="appointment-details">
                  <h3>Appointment Details</h3>
                  <div className="detail-item">
                    <strong>Doctor:</strong> Dr. {doctor.name}
                  </div>
                  <div className="detail-item">
                    <strong>Date:</strong> {appointment.appointment_date}
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong> {appointment.appointment_time}
                  </div>
                  <div className="detail-item">
                    <strong>Consultation Fee:</strong> ${doctor.fees}
                  </div>
                </div>
              )}

              <div className="success-actions">
                <button 
                  onClick={() => navigate('/patient/dashboard')}
                  className="btn btn-primary"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => navigate('/patient/doctors')}
                  className="btn btn-outline"
                >
                  Book Another Appointment
                </button>
              </div>

              <p className="redirect-message">
                You will be redirected to your dashboard in a few seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
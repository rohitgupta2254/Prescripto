import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { patientAPI } from '../../services/api';
import { CONSULTATION_TYPES } from '../../utils/constants';
import { validateAppointment } from '../../utils/validation';
import SlotSelector from './SlotSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/Patient.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/DatePicker.css';

const AppointmentBooking = ({ doctor, onBookingSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    consultation_type: CONSULTATION_TYPES.IN_PERSON,
    symptoms: ''
  });
  const [errors, setErrors] = useState({});

  // Clear form on successful booking
  useEffect(() => {
    return () => {
      setFormData({
        appointment_date: '',
        appointment_time: '',
        consultation_type: CONSULTATION_TYPES.IN_PERSON,
        symptoms: ''
      });
      setSelectedDate(null);
      setAvailableSlots([]);
    };
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, appointment_date: formattedDate }));
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    const dateString = date.toISOString().split('T')[0];
    setLoadingSlots(true);
    setError('');

    try {
      const response = await patientAPI.getAvailableSlots(doctor.id, dateString);
      setAvailableSlots(response.data.data.slots || []);
      setFormData(prev => ({ ...prev, appointment_date: dateString }));
    } catch (err) {
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, appointment_time: '' }));
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, appointment_time: time }));
    setErrors(prev => ({ ...prev, appointment_time: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateAppointment(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (!selectedDate || !formData.appointment_time) {
      setErrors({
        ...errors,
        appointment_time: 'Please select a valid date and time slot'
      });
      return;
    }

    setBooking(true);
    setError('');

    try {
      const response = await patientAPI.bookAppointment({
        doctorId: doctor.id,
        ...formData
      });

      if (onBookingSuccess) {
        onBookingSuccess(response.data.data);
      }

      // Clear form after successful booking
      setFormData({
        appointment_date: '',
        appointment_time: '',
        consultation_type: CONSULTATION_TYPES.IN_PERSON,
        symptoms: ''
      });
      setSelectedDate(null);
      setAvailableSlots([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days in advance

  return (
    <div className="appointment-booking">
      <h2>Book Appointment with Dr. {doctor.name}</h2>
      
      <div className="booking-summary">
        <div className="summary-item">
          <strong>Specialization:</strong> {doctor.specialization}
        </div>
        <div className="summary-item">
          <strong>Consultation Fee:</strong> ${doctor.fees}
        </div>
        <div className="summary-item">
          <strong>Address:</strong> {doctor.address}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Select Date & Time</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Appointment Date *</label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={maxDate}
                filterDate={(date) => date.getDay() !== 0} // No Sundays
                className={`form-input ${errors.appointment_date ? 'error' : ''}`}
                placeholderText="Select a date"
                required
              />
              {errors.appointment_date && (
                <span className="field-error">{errors.appointment_date}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Type *</label>
              <select
                name="consultation_type"
                value={formData.consultation_type}
                onChange={handleInputChange}
                className={`form-select ${errors.consultation_type ? 'error' : ''}`}
              >
                <option value={CONSULTATION_TYPES.IN_PERSON}>In-Person</option>
                <option value={CONSULTATION_TYPES.VIDEO}>Video Consultation</option>
              </select>
              {errors.consultation_type && (
                <span className="field-error">{errors.consultation_type}</span>
              )}
            </div>
          </div>

          {selectedDate && (
            <div className="form-group">
              <label className="form-label">Available Time Slots *</label>
              {loadingSlots ? (
                <LoadingSpinner text="Loading available slots..." size="small" />
              ) : availableSlots.length > 0 ? (
                <SlotSelector
                  slots={availableSlots}
                  selectedSlot={formData.appointment_time}
                  onSelectSlot={handleTimeSelect}
                  error={errors.appointment_time}
                />
              ) : (
                <div className="no-slots">
                  No available slots for this date. Please select another date.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label className="form-label">Symptoms or Reason for Visit</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Please describe your symptoms or reason for the appointment..."
              rows="4"
            />
          </div>
        </div>

        <div className="booking-actions">
          <button 
            type="submit" 
            disabled={booking || !formData.appointment_time}
            className="btn btn-primary btn-large"
          >
            {booking ? 'Booking...' : `Book Appointment - $${doctor.fees}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;
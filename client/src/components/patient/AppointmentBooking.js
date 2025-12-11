import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { patientAPI } from '../../services/api';
import { CONSULTATION_TYPES } from '../../utils/constants';
import { validateAppointment } from '../../utils/validation';
import { generateTimeSlots } from '../../utils/helpers';
import SlotSelector from './SlotSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/Patient.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/DatePicker.css';

const AppointmentBooking = ({ doctor, onBookingSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [timing, setTiming] = useState(null);
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
      // Format date as YYYY-MM-DD using local date components to avoid timezone shifts
      const pad = (n) => String(n).padStart(2, '0');
      const formattedDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      setFormData(prev => ({ ...prev, appointment_date: formattedDate }));
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  // Poll for availability every 10 seconds while a date is selected
  useEffect(() => {
    if (!selectedDate) return;

    const interval = setInterval(() => {
      fetchAvailableSlots(selectedDate);
    }, 10000); // every 10s

    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    // Use local date components to produce YYYY-MM-DD (avoid toISOString timezone conversion)
    const pad = (n) => String(n).padStart(2, '0');
    const dateString = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    setLoadingSlots(true);
    setError('');

    try {
      const response = await patientAPI.getAvailableSlots(doctor.id, dateString);
      const resSlots = response.data.data.slots || [];
      const resTiming = response.data.data.timing || null;
      setAvailableSlots(resSlots);
      setTiming(resTiming);

      // Compute all slots for the day based on timing
      if (resTiming && resTiming.start_time && resTiming.end_time) {
        const interval = resTiming.slot_duration || 30;
        const generated = generateTimeSlots(resTiming.start_time, resTiming.end_time, interval);
        setAllSlots(generated);
      } else {
        setAllSlots(resSlots);
      }
      setFormData(prev => ({ ...prev, appointment_date: dateString }));
    } catch (err) {
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
      setAllSlots([]);
      setTiming(null);
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
                  allSlots={allSlots}
                  availableSlots={availableSlots}
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
            className="btn btn-primary btn-large btn-no-shift"
          >
            <span className="btn-label" style={{ visibility: booking ? 'hidden' : 'visible' }}>{`Book Appointment - $${doctor.fees}`}</span>
            {booking && (
              <div className="btn-spinner">
                <LoadingSpinner size="small" text="" />
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;
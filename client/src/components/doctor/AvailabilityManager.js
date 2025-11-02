import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../utils/constants';
import '../../styles/Doctor.css';

const AvailabilityManager = () => {
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newTiming, setNewTiming] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    slot_duration: 30
  });

  useEffect(() => {
    fetchTimings();
  }, []);

  const fetchTimings = async () => {
    try {
      const response = await doctorAPI.getTimings();
      setTimings(response.data.data || []);
    } catch (err) {
      setError('Failed to load availability');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTiming(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTiming.day_of_week || !newTiming.start_time || !newTiming.end_time) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await doctorAPI.addTiming(newTiming);
      setSuccess('Availability added successfully');
      setNewTiming({
        day_of_week: '',
        start_time: '',
        end_time: '',
        slot_duration: 30
      });
      fetchTimings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTiming = async (timingId) => {
    if (!window.confirm('Are you sure you want to delete this timing?')) {
      return;
    }

    try {
      await doctorAPI.deleteTiming(timingId);
      setSuccess('Timing deleted successfully');
      fetchTimings();
    } catch (err) {
      setError('Failed to delete timing');
    }
  };

  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="availability-manager">
      <h2>Manage Availability</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="availability-form">
        <h3>Add New Timing</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                name="day_of_week"
                value={newTiming.day_of_week}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Day</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <select
                name="start_time"
                value={newTiming.start_time}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Start Time</option>
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{formatTimeDisplay(time)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <select
                name="end_time"
                value={newTiming.end_time}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select End Time</option>
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{formatTimeDisplay(time)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Slot Duration (minutes)</label>
              <select
                name="slot_duration"
                value={newTiming.slot_duration}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Adding...' : 'Add Timing'}
          </button>
        </form>
      </div>

      <div className="current-availability">
        <h3>Current Availability</h3>
        {timings.length === 0 ? (
          <div className="empty-state">
            <p>No availability set. Add your working hours above.</p>
          </div>
        ) : (
          <div className="timings-list">
            {timings.map(timing => (
              <div key={timing.id} className="timing-item">
                <div className="timing-info">
                  <span className="day">{timing.day_of_week}</span>
                  <span className="time">
                    {formatTimeDisplay(timing.start_time)} - {formatTimeDisplay(timing.end_time)}
                  </span>
                  <span className="duration">({timing.slot_duration} min slots)</span>
                </div>
                <button
                  onClick={() => handleDeleteTiming(timing.id)}
                  className="btn btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;
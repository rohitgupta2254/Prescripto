import { useState, useEffect } from 'react';
import { patientAPI, doctorAPI } from '../services/api';

export const useAppointments = (userType, status = '') => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = userType === 'patient' 
        ? await patientAPI.getAppointments(status)
        : await doctorAPI.getAppointments(status);
      
      setAppointments(response.data.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userType, status]);

  const cancelAppointment = async (appointmentId) => {
    try {
      await patientAPI.cancelAppointment(appointmentId);
      await fetchAppointments(); // Refresh the list
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel appointment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, status);
      await fetchAppointments(); // Refresh the list
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update appointment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    cancelAppointment,
    updateAppointmentStatus
  };
};
import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import PatientAppointments from '../../components/patient/PatientAppointments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/Patient.css';

const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsResponse, profileResponse] = await Promise.all([
        patientAPI.getAppointments('scheduled'),
        patientAPI.getProfile()
      ]);

      const upcomingAppointments = appointmentsResponse.data.data.appointments || [];
      
      setStats({
        upcomingAppointments: upcomingAppointments.length,
        totalAppointments: upcomingAppointments.length, // You might want to fetch all appointments for this
        ...profileResponse.data.data
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome back! Manage your appointments and healthcare needs.</p>
      </div>

      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.upcomingAppointments}</h3>
              <p>Upcoming Appointments</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>{stats.name}</h3>
              <p>Welcome back!</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-sections">
        <section className="appointments-section">
          <PatientAppointments />
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
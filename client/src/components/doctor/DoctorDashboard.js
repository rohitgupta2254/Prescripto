import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import StatsCard from './StatsCard';
import AppointmentList from './AppointmentList';
import '../../styles/Doctor.css';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, appointmentsResponse] = await Promise.all([
        doctorAPI.getDashboardStats(),
        doctorAPI.getAppointments('scheduled')
      ]);

      setStats(statsResponse.data.data);
      setAppointments(appointmentsResponse.data.data.appointments || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome back! Here's your practice overview.</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <StatsCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon="📅"
            color="blue"
          />
          <StatsCard
            title="Monthly Appointments"
            value={stats.monthlyAppointments}
            icon="📊"
            color="green"
          />
          <StatsCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon="👥"
            color="purple"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue || 0}`}
            icon="💰"
            color="orange"
          />
          {stats.ratingStats && (
            <StatsCard
              title="Average Rating"
              value={stats.ratingStats.average_rating || '0.0'}
              icon="⭐"
              color="yellow"
              subtitle={`${stats.ratingStats.total_reviews || 0} reviews`}
            />
          )}
        </div>
      )}

      <div className="dashboard-content">
        <div className="appointments-section">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <button 
              className="btn btn-outline"
              onClick={fetchDashboardData}
            >
              Refresh
            </button>
          </div>
          
          <AppointmentList 
            appointments={appointments} 
            onUpdate={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
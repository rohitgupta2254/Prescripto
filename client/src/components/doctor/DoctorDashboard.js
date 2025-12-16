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
  const [statusFilter, setStatusFilter] = useState('scheduled');

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, appointmentsResponse] = await Promise.all([
        doctorAPI.getDashboardStats(),
        doctorAPI.getAppointments(statusFilter)
      ]);

      setStats(statsResponse.data.data);

      let appts = appointmentsResponse.data.data.appointments || [];

      // If viewing completed, fetch consultation details for each appointment
      if (statusFilter === 'completed' && appts.length > 0) {
        const detailed = await Promise.all(appts.map(async (a) => {
          try {
            const resp = await doctorAPI.getConsultationDetails(a.id);
            a.consultationDetails = resp.data.data || null;
          } catch (err) {
            a.consultationDetails = null;
          }
          return a;
        }));
        appts = detailed;
      }

      setAppointments(appts);
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
          <div className="appointments-header">
            <h2>My Appointments</h2>
            <div className="appointments-tabs">
              <button className={`tab-btn ${statusFilter === 'scheduled' ? 'active' : ''}`} onClick={() => setStatusFilter('scheduled')}>Upcoming</button>
              <button className={`tab-btn ${statusFilter === 'completed' ? 'active' : ''}`} onClick={() => setStatusFilter('completed')}>Completed</button>
             
            </div>
            <div className="section-actions">
              <button 
                className="btn btn-outline"
                onClick={fetchDashboardData}
              >
                Refresh
              </button>
            </div>
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
import React, { useState, useEffect } from 'react';
import { doctorCancellationAPI } from '../../services/api';
import '../../styles/Doctor.css';

const RevenueSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRevenueSummary();
  }, []);

  const fetchRevenueSummary = async () => {
    try {
      setLoading(true);
      const response = await doctorCancellationAPI.getRevenueSummary();
      setSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revenue summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading revenue data...</div>;
  }

  if (!summary) {
    return <div className="error-message">{error}</div>;
  }

  const { total, monthly } = summary;

  return (
    <div className="revenue-summary-panel">
      <h2>Revenue Summary</h2>

      <div className="revenue-cards">
        {/* Total Statistics */}
        <div className="revenue-section">
          <h3>Total Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Appointments</div>
              <div className="stat-value">{total.appointments}</div>
              <div className="stat-detail">
                <span className="completed">{total.completed} Completed</span>
                <span className="cancelled">{total.cancelled} Cancelled</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${total.revenue.toFixed(2)}</div>
              <div className="stat-detail">Before refunds</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Refunds</div>
              <div className="stat-value refund">${total.refunds.toFixed(2)}</div>
              <div className="stat-detail">Cancelled appointments</div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-label">Net Revenue</div>
              <div className="stat-value net">${total.netRevenue.toFixed(2)}</div>
              <div className="stat-detail">After refunds</div>
            </div>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="revenue-section">
          <h3>This Month</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Monthly Appointments</div>
              <div className="stat-value">{monthly.appointments}</div>
              <div className="stat-detail">{monthly.completed} Completed</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Monthly Revenue</div>
              <div className="stat-value">${monthly.revenue.toFixed(2)}</div>
              <div className="stat-detail">Before refunds</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Monthly Refunds</div>
              <div className="stat-value refund">${monthly.refunds.toFixed(2)}</div>
              <div className="stat-detail">Cancelled this month</div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-label">Monthly Net</div>
              <div className="stat-value net">${monthly.netRevenue.toFixed(2)}</div>
              <div className="stat-detail">After refunds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="revenue-breakdown">
        <h3>Revenue Impact Analysis</h3>
        <div className="breakdown-chart">
          <div className="breakdown-row">
            <div className="breakdown-label">Total Revenue (before refunds):</div>
            <div className="breakdown-value">${total.revenue.toFixed(2)}</div>
          </div>
          <div className="breakdown-row negative">
            <div className="breakdown-label">Total Refunds:</div>
            <div className="breakdown-value">-${total.refunds.toFixed(2)}</div>
          </div>
          <div className="breakdown-row total">
            <div className="breakdown-label"><strong>Net Revenue:</strong></div>
            <div className="breakdown-value"><strong>${total.netRevenue.toFixed(2)}</strong></div>
          </div>
          {total.revenue > 0 && (
            <div className="breakdown-row info">
              <div className="breakdown-label">Refund Rate:</div>
              <div className="breakdown-value">
                {((total.refunds / total.revenue) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-primary" onClick={fetchRevenueSummary}>
        Refresh
      </button>
    </div>
  );
};

export default RevenueSummary;

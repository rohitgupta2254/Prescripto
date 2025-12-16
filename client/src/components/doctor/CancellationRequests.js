import React, { useState, useEffect } from 'react';
import { doctorCancellationAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import '../../styles/Doctor.css';

const CancellationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await doctorCancellationAPI.getPendingCancellations();
      setRequests(response.data.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Approve this cancellation request? A full refund will be initiated.')) {
      return;
    }

    setActionLoading(true);
    try {
      await doctorCancellationAPI.approveCancellation(requestId, { notes });
      alert('Cancellation approved. Refund initiated.');
      setActiveRequest(null);
      setNotes('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve cancellation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Reject this cancellation request? The appointment will remain scheduled.')) {
      return;
    }

    setActionLoading(true);
    try {
      await doctorCancellationAPI.rejectCancellation(requestId, { notes });
      alert('Cancellation request rejected.');
      setActiveRequest(null);
      setNotes('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject cancellation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading cancellation requests...</div>;
  }

  return (
    <div className="cancellation-requests-panel">
      <div className="panel-header">
        <h2>Cancellation Requests</h2>
        <span className="badge badge-count">{requests.length} Pending</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No pending cancellation requests</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="patient-info">
                  <h4>{request.patient_name}</h4>
                  <p className="patient-contact">{request.patient_email} | {request.patient_phone}</p>
                </div>
                <div className="refund-info">
                  <span className="refund-amount">${request.refund_amount}</span>
                  <span className="request-date">{formatDate(request.requested_at)}</span>
                </div>
              </div>

              <div className="appointment-details">
                <p><strong>Appointment Date:</strong> {formatDate(request.appointment_date)}</p>
                <p><strong>Appointment Time:</strong> {formatTime(request.appointment_time)}</p>
              </div>

              {request.reason && (
                <div className="cancellation-reason">
                  <p><strong>Reason provided:</strong></p>
                  <p className="reason-text">{request.reason}</p>
                </div>
              )}

              <div className="request-actions">
                {activeRequest === request.id ? (
                  <div className="action-form">
                    <textarea
                      placeholder="Optional notes for patient..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      disabled={actionLoading}
                    />
                    <div className="action-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Approve & Refund'}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setActiveRequest(null);
                          setNotes('');
                        }}
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveRequest(request.id)}
                  >
                    Review Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CancellationRequests;

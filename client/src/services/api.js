import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prescripto_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('prescripto_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  registerDoctor: (data) => api.post('/auth/doctor/register', data),
  loginDoctor: (data) => api.post('/auth/doctor/login', data),
  registerPatient: (data) => api.post('/auth/patient/register', data),
  loginPatient: (data) => api.post('/auth/patient/login', data),
  validateToken: (token) => api.get('/auth/me', { 
    headers: { Authorization: `Bearer ${token}` } 
  }),
  getMe: () => api.get('/auth/me'),
};

// Doctor API
export const doctorAPI = {
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  getAppointments: (status) => api.get(`/doctors/appointments?status=${status || ''}`),
  updateAppointmentStatus: (appointmentId, status) => 
    api.put(`/doctors/appointments/${appointmentId}/status`, { status }),
  completeAppointmentWithDetails: (appointmentId, data) =>
    api.post(`/doctors/appointments/${appointmentId}/complete`, data),
  getConsultationDetails: (appointmentId) =>
    api.get(`/doctors/appointments/${appointmentId}/consultation`),
  addTiming: (data) => api.post('/doctors/timings', data),
  getTimings: () => api.get('/doctors/timings'),
  deleteTiming: (timingId) => api.delete(`/doctors/timings/${timingId}`),
  getDashboardStats: () => api.get('/doctors/dashboard/stats'),
};

// Patient API
export const patientAPI = {
  searchDoctors: (filters) => api.get('/patients/doctors/search', { params: filters }),
  getDoctorProfile: (doctorId) => api.get(`/patients/doctors/${doctorId}`),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/patients/doctors/${doctorId}/slots?date=${date}`),
  bookAppointment: (data) => api.post('/patients/appointments', data),
  getAppointments: (status) => api.get(`/patients/appointments?status=${status || ''}`),
  cancelAppointment: (appointmentId) => 
    api.put(`/patients/appointments/${appointmentId}/cancel`),
  requestCancellation: (appointmentId, data) => 
    api.post(`/appointments/${appointmentId}/request-cancellation`, data),
  getRefundHistory: () => api.get('/appointments/refund-history'),
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  payWithUPI: (data) => api.post('/payments/upi', data),
  getPaymentHistory: () => api.get('/payments/history'),
  getPaymentByAppointment: (appointmentId) => 
    api.get(`/payments/appointment/${appointmentId}`),
};

// Review API
export const reviewAPI = {
  addReview: (data) => api.post('/reviews', data),
  getDoctorReviews: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
  getPatientReviews: () => api.get('/reviews'),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Doctor API - Cancellation Management
export const doctorCancellationAPI = {
  getPendingCancellations: () => api.get('/appointments/doctor/pending-cancellations'),
  approveCancellation: (requestId, data) => api.post(`/appointments/cancellation/${requestId}/approve`, data),
  rejectCancellation: (requestId, data) => api.post(`/appointments/cancellation/${requestId}/reject`, data),
  getRevenueSummary: () => api.get('/appointments/doctor/revenue-summary'),
  cancelAppointmentByDoctor: (appointmentId, data) => api.post(`/appointments/${appointmentId}/cancel-by-doctor`, data),
};

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  getReminders: () => api.get('/notifications/reminders'),
};

export default api;
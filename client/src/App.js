import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Pages
import Home from './pages/common/Home';
import NotFound from './pages/common/NotFound';

// Doctor Pages
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorRegister from './pages/doctor/DoctorRegister';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Patient Pages
import PatientLogin from './pages/patient/PatientLogin';
import PatientRegister from './pages/patient/PatientRegister';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorSearch from './pages/patient/DoctorSearch';
import BookingPage from './pages/patient/BookingPage';
import PatientProfile from './pages/patient/PatientProfile';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Styles
import './styles/App.css';
import './styles/Common.css';
import './styles/Doctor.css';
import './styles/Patient.css';
import './styles/Payment.css';
import './styles/Responsive.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Common Routes */}
              <Route path="/" element={<Home />} />
              
              {/* Doctor Routes */}
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/register" element={<DoctorRegister />} />
              <Route 
                path="/doctor/dashboard" 
                element={
                  <ProtectedRoute role="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/profile" 
                element={
                  <ProtectedRoute role="doctor">
                    <DoctorProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Patient Routes */}
              <Route path="/patient/login" element={<PatientLogin />} />
              <Route path="/patient/register" element={<PatientRegister />} />
              <Route 
                path="/patient/dashboard" 
                element={
                  <ProtectedRoute role="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/doctors" 
                element={
                  <ProtectedRoute role="patient">
                    <DoctorSearch />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/doctor/:doctorId/book" 
                element={
                  <ProtectedRoute role="patient">
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/profile" 
                element={
                  <ProtectedRoute role="patient">
                    <PatientProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback Routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
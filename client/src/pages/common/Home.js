import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Common.css';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Healthcare Made Simple</h1>
              <p className="hero-subtitle">
                Book doctor appointments online with Prescripto. 
                Find the right specialist, choose your preferred time, 
                and get the care you need.
              </p>
              <div className="hero-actions">
                {currentUser ? (
                  currentUser.role === 'patient' ? (
                    <Link to="/patient/doctors" className="btn btn-primary btn-large">
                      Find Doctors
                    </Link>
                  ) : (
                    <Link to="/doctor/dashboard" className="btn btn-primary btn-large">
                      Go to Dashboard
                    </Link>
                  )
                ) : (
                  <>
                    <Link to="/patient/register" className="btn btn-primary btn-large">
                      Book an Appointment
                    </Link>
                    <Link to="/doctor/login" className="btn btn-outline btn-large">
                      I'm a Doctor
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="placeholder-image">
                <span>👨‍⚕️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Prescripto?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Find the Right Doctor</h3>
              <p>Search by specialization, location, ratings, and availability to find your perfect healthcare provider.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Booking</h3>
              <p>Book appointments 24/7 with real-time availability. Receive instant confirmations and reminders.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Pay consultation fees securely online with multiple payment options and instant receipts.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Verified Reviews</h3>
              <p>Read genuine reviews from other patients and share your own experiences after appointments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Search & Select</h3>
              <p>Find a doctor based on your needs and check their availability.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Book Appointment</h3>
              <p>Choose your preferred date and time slot for the consultation.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Secure Payment</h3>
              <p>Pay the consultation fee securely through our platform.</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Visit & Review</h3>
              <p>Attend your appointment and share your experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of patients and doctors using Prescripto for better healthcare management.</p>
            <div className="cta-buttons">
              {!currentUser && (
                <>
                  <Link to="/patient/register" className="btn btn-primary btn-large">
                    Sign Up as Patient
                  </Link>
                  <Link to="/doctor/register" className="btn btn-outline btn-large">
                    Join as Doctor
                  </Link>
                </>
              )}
              {currentUser && currentUser.role === 'patient' && (
                <Link to="/patient/doctors" className="btn btn-primary btn-large">
                  Find Doctors Now
                </Link>
              )}
              {currentUser && currentUser.role === 'doctor' && (
                <Link to="/doctor/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
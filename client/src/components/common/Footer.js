import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Common.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Prescripto</h3>
            <p>Connecting patients with healthcare professionals for seamless appointment booking and management.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/patient/doctors">Find Doctors</Link></li>
              <li><Link to="/doctor/login">Doctor Login</Link></li>
              <li><Link to="/patient/login">Patient Login</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: support@prescripto.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: 123 Healthcare St, Medical City</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Prescripto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
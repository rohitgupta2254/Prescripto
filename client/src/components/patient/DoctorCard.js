import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, calculateAverageRating } from '../../utils/helpers';
import '../../styles/Patient.css';

const DoctorCard = ({ doctor, onBookAppointment }) => {
  const averageRating = calculateAverageRating(doctor.reviews || []);
  const totalReviews = doctor.reviews?.length || 0;

  return (
    <div className="doctor-card">
      <div className="doctor-header">
        <div className="doctor-avatar">
          {doctor.profile_picture ? (
            <img src={doctor.profile_picture} alt={doctor.name} />
          ) : (
            <div className="avatar-placeholder">
              {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="doctor-info">
          <h3 className="doctor-name">Dr. {doctor.name}</h3>
          <p className="doctor-specialization">{doctor.specialization}</p>
          
          <div className="doctor-rating">
            <div className="stars">
              {'★'.repeat(Math.round(averageRating))}
              {'☆'.repeat(5 - Math.round(averageRating))}
            </div>
            <span className="rating-text">
              {averageRating} ({totalReviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="doctor-details">
        <div className="detail-item">
          <span className="label">Experience:</span>
          <span className="value">
            {doctor.experience_years ? `${doctor.experience_years} years` : 'Not specified'}
          </span>
        </div>
        
        <div className="detail-item">
          <span className="label">Consultation Fee:</span>
          <span className="value fee">{formatCurrency(doctor.fees)}</span>
        </div>
        
        <div className="detail-item">
          <span className="label">Location:</span>
          <span className="value address">{doctor.address}</span>
        </div>
      </div>

      {doctor.qualifications && (
        <div className="doctor-qualifications">
          <p>{doctor.qualifications}</p>
        </div>
      )}

      <div className="doctor-actions">
        <Link 
          to={`/patient/doctor/${doctor.id}/book`}
          className="btn btn-primary"
        >
          Book Appointment
        </Link>
        <button 
          className="btn btn-outline"
          onClick={() => onBookAppointment(doctor.id)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
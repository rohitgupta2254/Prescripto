import React, { useState } from 'react';
import StarRatings from 'react-star-ratings';
import { reviewAPI } from '../../services/api';
import '../../styles/Common.css';

const ReviewModal = ({ appointment, doctor, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reviewAPI.addReview({
        doctorId: doctor.id,
        appointmentId: appointment.id,
        rating,
        comment
      });

      onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Rate Your Experience</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>How was your appointment with Dr. {doctor.name}?</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="rating-container">
                <StarRatings
                  rating={rating}
                  starRatedColor="#ffd700"
                  starHoverColor="#ffd700"
                  changeRating={setRating}
                  numberOfStars={5}
                  name='rating'
                  starDimension="30px"
                  starSpacing="5px"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Review (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with the doctor..."
                rows="4"
                className="form-textarea"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || rating === 0}
                className="btn btn-primary"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
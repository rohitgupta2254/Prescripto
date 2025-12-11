import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/Payment.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ appointment, doctor, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('test@oksbi');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // If UPI selected, call backend UPI endpoint to mark payment completed (test)
    if (paymentMethod === 'upi') {
      try {
        // Use our UPI testing endpoint — expects appointment id, amount and upiId
        await paymentAPI.payWithUPI({ appointmentId: appointment.id, amount: doctor.fees, upiId });
        onSuccess();
      } catch (err) {
        setError(err.response?.data?.message || 'UPI payment failed.');
      } finally {
        setLoading(false);
      }

      return;
    }

    // For card payments ensure Stripe is ready
    if (!stripe || !elements) {
      setError('Payment gateway not ready. Please try again in a moment.');
      setLoading(false);
      return;
    }

    try {
      // Create payment intent
      const paymentResponse = await paymentAPI.createPaymentIntent({
        appointmentId: appointment.id,
        amount: doctor.fees
      });

      const { clientSecret, paymentIntentId } = paymentResponse.data.data;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: appointment.patient_name,
          },
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        // Payment successful - confirm with our backend
        await paymentAPI.confirmPayment({
          paymentIntentId,
          appointmentId: appointment.id
        });
        
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h3>Complete Payment</h3>
        <p>Secure payment processed by Stripe</p>
      </div>

      <div className="payment-summary">
        <h4>Appointment Details</h4>
        <div className="summary-item">
          <span>Doctor:</span>
          <span>Dr. {doctor.name}</span>
        </div>
        <div className="summary-item">
          <span>Date:</span>
          <span>{appointment.appointment_date}</span>
        </div>
        <div className="summary-item">
          <span>Time:</span>
          <span>{appointment.appointment_time}</span>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <span>${doctor.fees}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-details">
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <label>
              <input type="radio" name="pm" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card
            </label>
            <label>
              <input type="radio" name="pm" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /> UPI (test)
            </label>
          </div>
        </div>

        {paymentMethod === 'upi' && (
          <div className="form-group">
            <label className="form-label">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="form-input"
              placeholder="example@bank"
            />
            <small className="form-help">Use a test UPI ID (e.g., test@oksbi) for local testing.</small>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="form-group">
            <label className="form-label">Card Details</label>
            <div className="card-element-container">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                      padding: '10px 12px',
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="payment-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={(paymentMethod === 'card' ? !stripe : false) || loading}
            className="btn btn-primary btn-no-shift"
          >
            <span className="btn-label" style={{ visibility: loading ? 'hidden' : 'visible' }}>{`Pay $${doctor.fees}`}</span>
            {loading && (
              <div className="btn-spinner">
                <LoadingSpinner size="small" text="" />
              </div>
            )}
          </button>
        </div>
      </form>

      <div className="payment-security">
        <div className="security-badge">
          <span>🔒</span>
          <span>Secure payment encrypted with SSL</span>
        </div>
        <div className="payment-methods">
          <span>Accepted Cards:</span>
          <div className="card-icons">
            <span>💳</span>
            <span>visa</span>
            <span>mastercard</span>
            <span>amex</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm {...props} />
  </Elements>
);

export default PaymentForm;
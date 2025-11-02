const db = require('../config/database');

// Initialize Stripe only if the secret key is present. This prevents the
// server from crashing when developers haven't set Stripe keys in .env.
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.error('❌ Failed to initialize Stripe client:', err.message);
    stripe = null;
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe payment endpoints will return errors until configured.');
}

class PaymentService {
  static ensureStripe() {
    if (!stripe) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your server .env');
    }
  }

  static async createPaymentIntent(amount, appointmentId) {
    try {
      this.ensureStripe();

      // Verify appointment exists and get details
      const [appointment] = await db.execute(
        `SELECT a.*, d.fees, d.name as doctor_name 
         FROM appointments a 
         INNER JOIN doctors d ON a.doctor_id = d.id 
         WHERE a.id = ?`,
        [appointmentId]
      );

      if (appointment.length === 0) {
        throw new Error('Appointment not found');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          appointment_id: appointmentId.toString(),
          doctor_name: appointment[0].doctor_name
        },
        description: `Appointment with Dr. ${appointment[0].doctor_name}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create pending payment record
      await db.execute(
        'INSERT INTO payments (appointment_id, amount, payment_method, transaction_id, status) VALUES (?, ?, "card", ?, "pending")',
        [appointmentId, amount, paymentIntent.id]
      );

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error(`Payment processing error: ${error.message}`);
    }
  }

  static async confirmPayment(paymentIntentId, appointmentId) {
    try {
      this.ensureStripe();

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update payment status to completed
        const [result] = await db.execute(
          'UPDATE payments SET status = "completed" WHERE transaction_id = ? AND appointment_id = ?',
          [paymentIntentId, appointmentId]
        );

        if (result.affectedRows === 0) {
          throw new Error('Payment record not found');
        }

        // Get the payment ID
        const [payment] = await db.execute(
          'SELECT id FROM payments WHERE transaction_id = ?',
          [paymentIntentId]
        );

        return {
          paymentId: payment[0].id,
          status: 'completed'
        };
      } else if (paymentIntent.status === 'requires_payment_method') {
        // Update payment status to failed
        await db.execute(
          'UPDATE payments SET status = "failed" WHERE transaction_id = ?',
          [paymentIntentId]
        );

        return { status: 'failed' };
      } else {
        return { status: paymentIntent.status };
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      
      // Mark payment as failed in case of error
      try {
        await db.execute(
          'UPDATE payments SET status = "failed" WHERE transaction_id = ?',
          [paymentIntentId]
        );
      } catch (e) {
        console.error('Failed to mark payment as failed:', e);
      }
      
      throw new Error(`Payment confirmation error: ${error.message}`);
    }
  }

  static async handleWebhook(payload, sig) {
    this.ensureStripe();

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      throw new Error('Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object;
        await this.handlePaymentFailure(failedPayment);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  static async handlePaymentSuccess(paymentIntent) {
    try {
      await db.execute(
        'UPDATE payments SET status = "completed" WHERE transaction_id = ?',
        [paymentIntent.id]
      );

      // Update appointment status if needed
      const appointmentId = paymentIntent.metadata && paymentIntent.metadata.appointment_id;
      if (appointmentId) {
        await db.execute(
          'UPDATE appointments SET status = "scheduled" WHERE id = ?',
          [appointmentId]
        );
      }

      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  static async handlePaymentFailure(paymentIntent) {
    try {
      await db.execute(
        'UPDATE payments SET status = "failed" WHERE transaction_id = ?',
        [paymentIntent.id]
      );
      console.log(`❌ Payment failed: ${paymentIntent.id}`);
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  static async refundPayment(paymentIntentId) {
    try {
      this.ensureStripe();

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      if (refund.status === 'succeeded') {
        await db.execute(
          'UPDATE payments SET status = "refunded" WHERE transaction_id = ?',
          [paymentIntentId]
        );
        return { success: true, refundId: refund.id };
      }

      return { success: false, status: refund.status };
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}

module.exports = PaymentService;
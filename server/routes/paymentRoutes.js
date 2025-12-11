const express = require('express');
const { 
  createPaymentIntent, 
  confirmPayment, 
  getPaymentHistory,
  getPaymentByAppointment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/upi', require('../controllers/paymentController').payWithUPI);
router.get('/history', getPaymentHistory);
router.get('/appointment/:appointmentId', getPaymentByAppointment);

// Webhook route (no protection needed for webhooks)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const PaymentService = require('../services/paymentService');
  const sig = req.headers['stripe-signature'];

  try {
    await PaymentService.handleWebhook(req.body, sig);
    res.json({received: true});
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
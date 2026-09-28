// const express = require('express');
// const router = express.Router();
// const { optionalProtect } = require('../middleware/authMiddleware');
// const {
//   initiatePayment,
//   handleIPN,
//   validatePayment,
//   getPaymentStatus
// } = require('../controllers/paymentController');

// // IPN route (no auth required - SSL Commerz calls this)
// router.post('/ipn', handleIPN);

// // Payment initiation
// router.post('/initiate', optionalProtect, initiatePayment);

// // Payment validation (after return from payment gateway)
// router.get('/validate', optionalProtect, validatePayment);

// // Get payment status
// router.get('/status/:orderId', optionalProtect, getPaymentStatus);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');
const {
  initiatePayment,
  prepareOrderData,
  handleIPN,
  validatePayment,
  getPaymentStatus
} = require('../controllers/paymentController');

// Public routes
router.post('/initiate', optionalProtect, initiatePayment);
router.post('/prepare', optionalProtect, prepareOrderData);
router.post('/ipn', handleIPN);
router.get('/validate', validatePayment);
router.get('/status/:orderId', optionalProtect, getPaymentStatus);

module.exports = router;
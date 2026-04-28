import express from 'express';
import { 
  createStripePayment,
  createBankTransferPayment,
  getPendingPayments,
  verifyPayment,
  rejectPayment,
  getPaymentByAppointment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patient Routes (protected)
router.post('/stripe-checkout', protect, createStripePayment);
router.post('/bank-transfer', protect, createBankTransferPayment);

// Public routes for payment info
router.get('/appointment/:appointmentId', getPaymentByAppointment);

// Admin Routes (protected)
router.get('/admin/pending', protect, getPendingPayments);
router.put('/admin/verify/:paymentId', protect, verifyPayment);
router.put('/admin/reject/:paymentId', protect, rejectPayment);

export default router;
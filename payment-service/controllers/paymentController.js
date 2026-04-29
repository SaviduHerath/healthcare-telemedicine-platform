import Stripe from 'stripe';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js';
import axios from 'axios';

// Load env at the very top of the file
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008';
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5004';

// Helper function to call the Notification Service
const sendNotification = async (email, phoneNumber, subject, message) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email-and-sms`, {
      toEmail: email,
      toPhone: phoneNumber,
      subject,
      message
    });
    console.log(`📧/📱 Notification sent to ${email || phoneNumber}`);
  } catch (error) {
    console.error("❌ Notification Service error:", error.response?.data || error.message);
  }
};

// 1. Create Stripe Checkout Session
export const createStripePayment = async (req, res) => {
    try {
        const { appointmentId, amount, patientEmail, patientPhone, patientName, patientId, doctorId, doctorName } = req.body;

        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe Secret Key is missing from .env file");
        }

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { 
                        name: `Medical Consultation: ${appointmentId}`,
                        description: `Doctor: ${doctorName}`
                    },
                    unit_amount: Math.round(amount * 100), // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:5173/payment-success?id=${appointmentId}`,
            cancel_url: `http://localhost:5173/payment-cancelled`,
            customer_email: patientEmail,
        });

        // Create payment record
        const payment = await Payment.create({
            appointmentId,
            patientId,
            patientName,
            patientEmail,
            patientPhone,
            doctorId,
            doctorName,
            amount,
            paymentMethod: 'stripe',
            stripeSessionId: session.id,
            status: 'Pending'
        });

        res.status(200).json({ 
            message: "Stripe session created", 
            sessionId: session.id, 
            url: session.url,
            paymentId: payment._id
        });

    } catch (error) {
        console.error("💥 STRIPE PAYMENT FAIL:", error.message);
        res.status(500).json({ 
            message: 'Payment Error', 
            error: error.message
        });
    }
};

// 2. Bank Transfer Payment with Receipt
export const createBankTransferPayment = async (req, res) => {
    try {
        const { 
            appointmentId, 
            amount, 
            patientId, 
            patientName, 
            patientEmail, 
            patientPhone,
            doctorId,
            doctorName,
            bankName,
            accountHolder,
            accountNumber,
            routingNumber,
            transactionReference,
            receiptImageUrl
        } = req.body;

        console.log('🏦 Bank Transfer Payment Request:', {
            appointmentId,
            amount,
            patientName,
            paymentMethod: 'bank_transfer'
        });

        // Validation
        if (!appointmentId || !amount || !patientId) {
            return res.status(400).json({ 
                message: 'Missing required fields: appointmentId, amount, patientId'
            });
        }

        // Dedupe guard: prevent multiple pending bank-transfer rows
        // (common when users click submit multiple times).
        const existingPending = await Payment.findOne({
            appointmentId,
            patientId,
            paymentMethod: 'bank_transfer',
            status: 'Pending'
        });

        if (existingPending) {
            return res.status(200).json({
                message: 'A pending bank transfer already exists for this appointment.',
                paymentId: existingPending._id,
                payment: existingPending
            });
        }

        // Create payment record
        const payment = await Payment.create({
            appointmentId,
            patientId,
            patientName,
            patientEmail,
            patientPhone,
            doctorId,
            doctorName,
            amount,
            paymentMethod: 'bank_transfer',
            bankTransferDetails: {
                bankName,
                accountHolder,
                accountNumber,
                routingNumber,
                transactionReference,
                receiptImageUrl
            },
            status: 'Pending'
        });

        console.log('✅ Bank Transfer Payment Created:', payment._id);

        // Send confirmation email to patient
        await sendNotification(
            patientEmail,
            patientPhone,
            'Bank Transfer Payment Received - Awaiting Verification',
            `Dear ${patientName},\n\nThank you for submitting your bank transfer payment for the appointment with Dr. ${doctorName}.\n\nAmount: Rs. ${amount}\nTransaction Reference: ${transactionReference}\n\nYour payment is awaiting admin verification. We will send you an email once it's verified.\n\nBest regards,\nHealthcare Platform Team`
        );

        res.status(201).json({ 
            message: "Bank transfer payment recorded. Awaiting admin verification.", 
            paymentId: payment._id,
            payment
        });

    } catch (error) {
        console.error("💥 BANK TRANSFER FAIL:", error.message);
        res.status(500).json({ 
            message: 'Bank Transfer Error', 
            error: error.message
        });
    }
};

// 3. Get all pending payments (Admin)
export const getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .sort({ createdAt: -1 });
        
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

// 4. Verify and confirm payment (Admin)
export const verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { adminId, adminNotes, status } = req.body;

        // Atomic guard: only a Pending payment can be verified.
        // Prevents duplicate notifications from repeated admin clicks/requests.
        const payment = await Payment.findOneAndUpdate(
            { _id: paymentId, status: 'Pending' },
            {
                status: status || 'Verified',
                adminVerified: true,
                adminVerifiedBy: adminId,
                adminVerificationDate: new Date(),
                adminNotes
            },
            { returnDocument: 'after' } // Mongoose 8+: replaces deprecated { new: true }
        );

        if (!payment) {
            const existing = await Payment.findById(paymentId).lean();
            if (!existing) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            return res.status(409).json({
                message: `Payment already processed with status: ${existing.status}`
            });
        }

        // Mark the related appointment as Paid so the patient can start video call.
        // (Patient UI gates video call on appointment.status === 'Paid' or 'Completed')
        try {
            if (payment.appointmentId) {
                await axios.put(`${APPOINTMENT_SERVICE_URL}/api/appointments/${payment.appointmentId}/status`, {
                    status: 'Paid'
                });
            }
        } catch (apptErr) {
            console.error("❌ Appointment Service error (mark Paid):", apptErr.response?.data || apptErr.message);
        }

        // Send confirmation email to patient
        await sendNotification(
            payment.patientEmail,
            payment.patientPhone,
            'Payment Verified ✅',
            `Dear ${payment.patientName},\n\nYour payment for the appointment with Dr. ${payment.doctorName} has been verified successfully.\n\nAmount: Rs. ${payment.amount}\nPayment Method: ${payment.paymentMethod === 'stripe' ? 'Credit/Debit Card' : 'Bank Transfer'}\n\nYou can now proceed with your appointment booking.\n\nBest regards,\nHealthcare Platform Team`
        );

        res.status(200).json({ 
            message: 'Payment verified successfully', 
            payment 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

// 5. Reject payment (Admin)
export const rejectPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { adminId, adminNotes } = req.body;

        // Atomic guard: only a Pending payment can be rejected.
        const payment = await Payment.findOneAndUpdate(
            { _id: paymentId, status: 'Pending' },
            {
                status: 'Declined',
                adminVerifiedBy: adminId,
                adminVerificationDate: new Date(),
                adminNotes
            },
            { returnDocument: 'after' } // Mongoose 8+: replaces deprecated { new: true }
        );

        if (!payment) {
            const existing = await Payment.findById(paymentId).lean();
            if (!existing) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            return res.status(409).json({
                message: `Payment already processed with status: ${existing.status}`
            });
        }

        // Send rejection email to patient
        await sendNotification(
            payment.patientEmail,
            payment.patientPhone,
            'Payment Rejected ❌',
            `Dear ${payment.patientName},\n\nUnfortunately, your payment for the appointment with Dr. ${payment.doctorName} could not be verified.\n\nReason: ${adminNotes || 'Payment verification failed'}\n\nPlease contact support for more details or try again with a different payment method.\n\nBest regards,\nHealthcare Platform Team`
        );

        res.status(200).json({ 
            message: 'Payment rejected', 
            payment 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error rejecting payment', error: error.message });
    }
};

// 6. Get payment by appointment ID
export const getPaymentByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const payment = await Payment.findOne({ appointmentId });
        
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment', error: error.message });
    }
};
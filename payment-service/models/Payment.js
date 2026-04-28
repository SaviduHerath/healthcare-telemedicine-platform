import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: { type: String },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  
  amount: { type: Number, required: true },
  
  // Payment Method
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'bank_transfer'], 
    required: true 
  },
  
  // Stripe Payment
  stripePaymentId: { type: String },
  stripeSessionId: { type: String },
  
  // Bank Transfer Details
  bankTransferDetails: {
    bankName: String,
    accountHolder: String,
    accountNumber: String,
    routingNumber: String,
    transactionReference: String,
    receiptImageUrl: String
  },
  
  // Payment Status
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed', 'Verified', 'Declined'], 
    default: 'Pending' 
  },
  
  // Admin Verification
  adminVerified: { type: Boolean, default: false },
  adminVerifiedBy: String,
  adminVerificationDate: Date,
  adminNotes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, required: true }, // Needed for SMS
    
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    
    appointmentDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'Cancelled'], 
      default: 'Confirmed' 
    },
    consultationFee: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
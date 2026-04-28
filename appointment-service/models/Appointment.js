import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: { type: String },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g., "10:00 AM"
  
  // Consultation Fee - captured from doctor's profile at booking time
  consultationFee: { type: Number, default: 1500 },

  // Patient uploaded medical reports at booking time
  medicalReports: [{
    originalName: String,
    fileName: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Lifecycle Tracking
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Declined', 'Paid', 'Completed'], 
    default: 'Pending' 
  },

  // Doctor completion note saved when appointment is marked as completed
  doctorCompletionNote: { type: String, default: '' },
  doctorCompletionNotedAt: Date
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
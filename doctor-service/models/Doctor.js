import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Sub-schema for Doctor's Availability
const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., "Monday"
  startTime: { type: String, required: true }, // e.g., "09:00 AM"
  endTime: { type: String, required: true } // e.g., "12:00 PM"
});

// 2. Main Doctor Schema
const doctorSchema = new mongoose.Schema({
  
  
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'Doctor' },
  phoneNumber: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  medicalLicenseNumber: { type: String, required: true },
  isApproved: { type: Boolean, default: false }, // Doctors usually need Admin approval
  
  
  bio: { type: String, default: '' },
  consultationFee: { type: Number, default: 0 },
  profilePicture: { type: String, default: '' },
  
  //  Working Hours 
  availability: [availabilitySchema]

}, { timestamps: true });

// Hash the password before saving 
doctorSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('Doctor', doctorSchema);
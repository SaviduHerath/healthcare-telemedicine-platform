import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'Patient' },
  phoneNumber: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  
  bloodGroup: { type: String, required: true },
  allergies: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dateOfBirth: { type: Date, required: true }
}, { timestamps: true });

// Hash the password before saving to the database (Updated for Mongoose 8+)
patientSchema.pre('save', async function() {
  // If the password hasn't been changed/added, just exit the function
  if (!this.isModified('password')) return;
  
  // Hash the password using bcrypt
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('Patient', patientSchema);
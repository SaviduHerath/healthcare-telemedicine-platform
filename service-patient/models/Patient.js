import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String },
  medicalHistory: [{ type: String }],
  uploadedReports: [{ type: String }] // We will store file URLs here later
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
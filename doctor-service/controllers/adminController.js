import Doctor from '../models/Doctor.js';
import axios from 'axios';

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008';



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

export const approveDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { isApproved: true },
      { returnDocument: 'after' } // Mongoose 8+: replaces deprecated { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    // --- TRIGGER NOTIFICATION ---
    await sendNotification(
      updatedDoctor.email, 
      updatedDoctor.phoneNumber,
      "Registration Approved! ✅", 
      `Hi Dr. ${updatedDoctor.fullName}, your registration has been approved. You can now login to your dashboard and start accepting appointments.`
    );

    res.status(200).json({
      message: "Doctor approved successfully and notified.",
      doctor: { id: updatedDoctor._id, isApproved: updatedDoctor.isApproved }
    });

  } catch (error) {
    console.error("💥 ADMIN ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// GET ALL UNAPPROVED DOCTORS
export const getUnapprovedDoctors = async (req, res) => {
  try {
    // Find all doctors where isApproved is false
    const doctors = await Doctor.find({ isApproved: false });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("💥 ERROR FETCHING DOCTORS:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REJECT DOCTOR
export const rejectDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    // Find doctor before deleting to get their email address
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const doctorEmail = doctor.email;
    const doctorName = doctor.fullName;

    await Doctor.findByIdAndDelete(doctorId);

    // --- TRIGGER NOTIFICATION ---
    await sendNotification(
      doctorEmail, 
      doctor.phoneNumber,
      "Update on your Registration ❌", 
      `Dear ${doctorName}, unfortunately, your registration was not approved at this time. Please contact support for more details.`
    );

    res.status(200).json({ message: "Doctor registration rejected and notified." });
  } catch (error) {
    console.error("💥 ERROR REJECTING DOCTOR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL DOCTORS
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
  } catch (error) {
    console.error("💥 ERROR FETCHING ALL DOCTORS:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
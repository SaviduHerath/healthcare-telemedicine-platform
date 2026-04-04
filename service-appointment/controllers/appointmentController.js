import Appointment from '../models/Appointment.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio and Nodemailer
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Helper function to send notifications
const sendNotifications = async (appointment) => {
  const message = `Hello ${appointment.patientName}, your appointment with Dr. ${appointment.doctorName} on ${new Date(appointment.appointmentDate).toLocaleString()} is confirmed!`;

  try {
    // 1. Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: appointment.patientEmail,
      subject: 'Appointment Confirmed - TeleMedicine Platform',
      text: message
    });
    console.log('✅ Confirmation Email Sent!');

    // 2. Send SMS
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: appointment.patientPhone
    });
    console.log('✅ Confirmation SMS Sent!');
  } catch (error) {
    console.error('⚠️ Notification Error (Check Credentials):', error.message);
  }
};

// @route POST /api/appointments/book
export const bookAppointment = async (req, res) => {
  try {
    const { patientId, patientName, patientEmail, patientPhone, doctorId, appointmentDate } = req.body;

    // 1. Microservice Communication: Verify the Doctor exists and is approved (Port 5002)
    const docResponse = await axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors/approved`);
    const doctor = docResponse.data.find(
      (doc) => String(doc._id) === String(doctorId)
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found or not approved' });
    }

    // 2. Create the Appointment
    const appointment = await Appointment.create({
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName: doctor.name,
      appointmentDate,
      consultationFee: doctor.consultationFee
    });

    // 3. Fire off the Notifications (Async so it doesn't block the frontend)
    sendNotifications(appointment);

    res.status(201).json({ message: 'Appointment booked successfully!', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
};

// @route GET /api/appointments/patient/:patientId
export const getPatientAppointments = async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.params.patientId }).sort({ appointmentDate: 1 });
  res.json(appointments);
};

// @route GET /api/appointments/doctor/:doctorId
export const getDoctorAppointments = async (req, res) => {
  const appointments = await Appointment.find({ doctorId: req.params.doctorId }).sort({ appointmentDate: 1 });
  res.json(appointments);
};
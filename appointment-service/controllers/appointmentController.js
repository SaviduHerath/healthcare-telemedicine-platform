import Appointment from '../models/Appointment.js';
import axios from 'axios';

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008';
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002';

// Helper function to call the Notification Service
const sendNotification = async (email, phoneNumber, subject, message) => {
  try {
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email-and-sms`, {
      toEmail: email,
      toPhone: phoneNumber,
      subject,
      message
    });
    console.log('Notification API response:', JSON.stringify({
      toEmail: email || null,
      toPhone: phoneNumber || null,
      subject,
      success: response?.data?.success,
      results: response?.data?.results || null
    }));

    // Combined endpoint can return success=true even when SMS fails (if email succeeded).
    const smsFailed = Boolean(
      phoneNumber &&
      response?.data?.results?.sms &&
      response.data.results.sms.success === false &&
      response.data.results.sms.skipped === false
    );

    if (smsFailed) {
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-sms`, {
          to: phoneNumber,
          message
        });
        console.log(`📱 SMS retry succeeded for ${phoneNumber}`);
      } catch (smsError) {
        console.error("❌ SMS retry failed:", smsError.response?.data || smsError.message);
      }
    }

    console.log(`📧/📱 Notification triggered for ${email || phoneNumber}`);
  } catch (error) {
    console.error("❌ Notification Service error:", error.response?.data || error.message);
  }
};

// For critical status updates, call email/SMS endpoints separately so one channel
// cannot mask failures in the other.
const sendStatusNotification = async (email, phoneNumber, subject, message) => {
  const tasks = [];
  if (email) {
    tasks.push(
      axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email`, {
        to: email,
        subject,
        message
      })
    );
  }
  if (phoneNumber) {
    tasks.push(
      axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-sms`, {
        to: phoneNumber,
        message
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`❌ Status notify channel ${index + 1} failed:`, result.reason?.response?.data || result.reason?.message);
    }
  });
};

// Helper: fetch doctor contact details for notification delivery.
const getDoctorContact = async (doctorId) => {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
    const doctor = response.data || {};
    return {
      name: doctor.fullName || doctor.name || 'Doctor',
      email: doctor.email || '',
      phoneNumber: doctor.phoneNumber || doctor.phone || ''
    };
  } catch (error) {
    console.error('❌ Doctor Service error (fetch contact):', error.response?.data || error.message);
    return { name: 'Doctor', email: '', phoneNumber: '' };
  }
};

// 1. The Slot Availability Check
// GET /api/appointments/slots?doctorId=123&date=2026-04-20
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // all possible slots for a day (can be dynamic based on doctor's working hours)
    const allSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
      "11:00 AM", "11:30 AM", "12:00 PM", "04:00 PM", 
      "04:30 PM", "05:00 PM"
    ];

    
    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'Declined' } 
    });

    const bookedSlots = bookedAppointments.map(appt => appt.timeSlot);

    // Available Slots = All Slots - Booked Slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ date, availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error: error.message });
  }
};

// 2. The Booking Flow & Collision Check
// POST /api/appointments/book
export const bookAppointment = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      date,
      timeSlot,
      consultationFee
    } = req.body;

    // Collision Check: Check if the slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'Declined' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Sorry, this slot is already taken!' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const medicalReports = (req.files || []).map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      url: `${baseUrl}/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size
    }));

    // If available, create the appointment
    const newAppointment = await Appointment.create({
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName,
      date,
      timeSlot,
      consultationFee: consultationFee ? Number(consultationFee) : 1500,
      medicalReports
    });

    // Send confirmation email to patient
    await sendNotification(
      patientEmail,
      patientPhone,
      'Appointment Booking Confirmation',
      `Dear ${patientName},\n\nThank you for booking an appointment with Dr. ${doctorName} on ${date} at ${timeSlot}.\n\nWe will notify you once the doctor approves your appointment.\n\nConsultation Fee: Rs. ${consultationFee || 1500}\n\nBest regards,\nHealthcare Platform Team`
    );

    // Notify doctor about new pending booking if contact data is available.
    const doctorContact = await getDoctorContact(doctorId);
    const resolvedDoctorEmail = doctorContact.email || doctorEmail || '';
    const resolvedDoctorPhone = doctorContact.phoneNumber || doctorPhone || '';
    const resolvedDoctorName = doctorContact.name || doctorName || 'Doctor';

    if (resolvedDoctorEmail || resolvedDoctorPhone) {
      await sendNotification(
        resolvedDoctorEmail,
        resolvedDoctorPhone,
        'New Appointment Request',
        `Dear Dr. ${resolvedDoctorName},\n\nYou have a new appointment request from ${patientName} for ${date} at ${timeSlot}.\n\nPlease review and accept or decline this appointment in your dashboard.\n\nBest regards,\nHealthcare Platform Team`
      );
    } else {
      console.warn(`⚠️ Doctor contact missing for doctorId=${doctorId}. Skipped doctor notification.`);
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
};

// 3. The Doctor's "To-Do List" 
// GET /api/appointments/doctor/:doctorId
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId }).sort({ date: 1, timeSlot: 1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// 4. The Status Update Mechanism
// PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorCompletionNote } = req.body; // 'Accepted', 'Declined', 'Completed' etc.

    const validStatuses = ['Pending', 'Accepted', 'Declined', 'Paid', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatePayload = { status };
    if (status === 'Completed') {
      updatePayload.doctorCompletionNote = (doctorCompletionNote || '').trim();
      updatePayload.doctorCompletionNotedAt = new Date();
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updatePayload,
      { returnDocument: 'after' } // Mongoose 8+: replaces deprecated { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if ((status === 'Accepted' || status === 'Declined') && updatedAppointment.patientEmail) {
      console.log('Status update notify payload:', JSON.stringify({
        appointmentId: updatedAppointment._id,
        status,
        toEmail: updatedAppointment.patientEmail || null,
        toPhone: updatedAppointment.patientPhone || null
      }));
      const statusSubject = status === 'Accepted'
        ? 'Appointment Confirmed! ✅'
        : 'Appointment Update: Declined ❌';
      const statusMessage = status === 'Accepted'
        ? `Dear ${updatedAppointment.patientName},\n\nGreat news! Dr. ${updatedAppointment.doctorName} has accepted your appointment request for ${updatedAppointment.date} at ${updatedAppointment.timeSlot}.\n\nPlease ensure you are available at the scheduled time.\n\nThank you!`
        : `Dear ${updatedAppointment.patientName},\n\nWe regret to inform you that Dr. ${updatedAppointment.doctorName} is unavailable for the requested slot on ${updatedAppointment.date} at ${updatedAppointment.timeSlot}.\n\nYour appointment has been declined. Please try booking another time slot.\n\nApologies for any inconvenience.`;

      await sendStatusNotification(
        updatedAppointment.patientEmail,
        updatedAppointment.patientPhone,
        statusSubject,
        statusMessage
      );
    }

    if (status === 'Completed' && updatedAppointment.patientEmail) {
      const noteSection = updatePayload.doctorCompletionNote
        ? `\n\nDoctor's quick note:\n${updatePayload.doctorCompletionNote}`
        : '';

      await sendStatusNotification(
        updatedAppointment.patientEmail,
        updatedAppointment.patientPhone,
        'Appointment Completed - Doctor Note',
        `Dear ${updatedAppointment.patientName},\n\nYour appointment with Dr. ${updatedAppointment.doctorName} on ${updatedAppointment.date} at ${updatedAppointment.timeSlot} has been marked as completed.${noteSection}\n\nBest regards,\nHealthcare Platform Team`
      );
    }

    res.status(200).json({ message: `Appointment ${status}`, appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

// 5. Patient: Get their own appointments
// GET /api/appointments/patient/:patientId
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId }).sort({ date: 1, timeSlot: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient appointments', error: error.message });
  }
};

// 6. Patient: Update appointment (Reschedule)
// PUT /api/appointments/:id
export const updatePatientAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.body;

    const appointmentToUpdate = await Appointment.findById(id);
    if (!appointmentToUpdate) return res.status(404).json({ message: 'Appointment not found' });

    // Once video call becomes available (Paid), rescheduling is locked.
    // Cancellation remains allowed through delete endpoint.
    if (appointmentToUpdate.status === 'Paid' || appointmentToUpdate.status === 'Completed') {
      return res.status(400).json({
        message: 'Rescheduling is not allowed after video call is enabled. You can still cancel this appointment.'
      });
    }

    // Collision check
    const existing = await Appointment.findOne({ 
      doctorId: appointmentToUpdate.doctorId, 
      date, 
      timeSlot, 
      status: { $ne: 'Declined' },
      _id: { $ne: id }
    });

    if (existing) {
      return res.status(400).json({ message: 'Slot already taken by another patient' });
    }

    const updated = await Appointment.findByIdAndUpdate(id, { date, timeSlot, status: 'Pending' }, { returnDocument: 'after' }); // Mongoose 8+
    res.status(200).json({ message: 'Appointment rescheduled successfully', appointment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// 7. Patient: Delete appointment (Cancel)
// DELETE /api/appointments/:id
export const deletePatientAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });

    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};
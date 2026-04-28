import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getAvailableSlots, 
  bookAppointment, 
  getDoctorAppointments, 
  updateAppointmentStatus,
  getPatientAppointments,
  updatePatientAppointment,
  deletePatientAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

// Routes
router.get('/slots', getAvailableSlots); // Slot Generation
router.post('/book', upload.array('medicalReports', 5), bookAppointment); // The Booking Flow + optional medical reports
router.get('/doctor/:doctorId', getDoctorAppointments); // Doctor's To-Do List
router.put('/:id/status', updateAppointmentStatus); // Status Tracking (Accept/Decline)

// Patient Routes
router.get('/patient/:patientId', getPatientAppointments);
router.put('/:id', updatePatientAppointment);
router.delete('/:id', deletePatientAppointment);

export default router;
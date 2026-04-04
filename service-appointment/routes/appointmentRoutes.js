import express from 'express';
import { bookAppointment, getPatientAppointments, getDoctorAppointments } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/book', bookAppointment);
router.get('/patient/:patientId', getPatientAppointments);
router.get('/doctor/:doctorId', getDoctorAppointments);

export default router;
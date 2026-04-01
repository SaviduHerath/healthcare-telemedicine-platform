import express from 'express';
import { registerPatient } from '../controllers/patientController.js';
import { loginPatient } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getPatientProfile } from '../controllers/patientController.js';    

const router = express.Router();

// Route: POST /api/patients/register
// The logic is now handled by the registerPatient controller function
router.post('/register', registerPatient);

router.post('/login', loginPatient);

router.get('/profile', protect, getPatientProfile);

export default router;
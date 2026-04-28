import express from 'express';
import { registerPatient , loginPatient} from '../controllers/authController.js';

const router = express.Router();

// POST Request to register a patient
router.post('/register', registerPatient);

// POST Request to login a patient
router.post('/login', loginPatient);
export default router;
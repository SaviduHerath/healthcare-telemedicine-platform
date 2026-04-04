import express from 'express';
import { 
  registerDoctor, 
  loginDoctor, 
  getDoctorProfile, 
  updateDoctorProfile, 
  getApprovedDoctors 
} from '../controllers/doctorController.js';
import { protectDoctor } from '../middleware/authMiddleware.js';

import { getPendingDoctors, approveDoctor } from '../controllers/doctorController.js'; // <-- Update your import

const router = express.Router();

// Public Routes
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/approved', getApprovedDoctors); // Patients will call this!

// Protected Routes (Doctor must be logged in)
router.get('/profile', protectDoctor, getDoctorProfile);
router.put('/profile', protectDoctor, updateDoctorProfile);



// Add these to your public/internal routes
router.get('/pending', getPendingDoctors);
router.put('/:id/approve', approveDoctor);

export default router;
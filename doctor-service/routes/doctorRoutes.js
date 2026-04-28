import express from 'express';
import { 
  searchDoctors, 
  updateProfile, 
  updateAvailability, 
  getDoctorProfile 
} from '../controllers/doctorController.js';

const router = express.Router();

// Public Routes (For Patients)
router.get('/search', searchDoctors); 
router.get('/:id', getDoctorProfile);

// Private Routes (For Doctors to manage their own profile)
// Note: In a real app, you would add a JWT verification middleware here 
// e.g., router.put('/profile/:id', verifyToken, updateProfile);
router.put('/profile/:id', updateProfile);
router.put('/availability/:id', updateAvailability);

export default router;
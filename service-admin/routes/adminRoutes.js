import express from 'express';
import { loginAdmin, fetchPendingDoctors, approveDoctorAccount } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/doctors/pending', fetchPendingDoctors);
router.put('/doctors/approve/:id', approveDoctorAccount);

export default router;
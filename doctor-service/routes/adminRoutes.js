import express from 'express';
import { approveDoctor, getUnapprovedDoctors, rejectDoctor, getAllDoctors } from '../controllers/adminController.js';

const router = express.Router();

// PUT Request to approve a specific doctor
// Notice the ":id" - this is a dynamic variable in the URL!
router.put('/approve-doctor/:id', approveDoctor);
router.delete('/reject-doctor/:id', rejectDoctor);
router.get('/unapproved-doctors', getUnapprovedDoctors);
router.get('/all-doctors', getAllDoctors);

export default router;
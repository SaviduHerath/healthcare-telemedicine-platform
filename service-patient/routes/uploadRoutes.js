import express from 'express';
import multer from 'multer';
import path from 'path';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Configure where to save the files and what to name them
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save in the uploads folder
  },
  filename(req, file, cb) {
    // Name the file: patientId-timestamp.extension
    cb(null, `${req.patient.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// 2. Route: POST /api/patients/upload
// Uses 'protect' to ensure only logged-in patients can upload
// Uses 'upload.single('report')' to accept one file sent with the key 'report'
router.post('/upload', protect, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find the patient and add the file path to their 'uploadedReports' array
    const patient = await Patient.findById(req.patient.id);
    if (patient) {
      const filePath = `/${req.file.path}`; // e.g., /uploads/123-456.pdf
      patient.uploadedReports.push(filePath);
      await patient.save();

      res.status(200).json({ message: 'File uploaded successfully', filePath });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

export default router;
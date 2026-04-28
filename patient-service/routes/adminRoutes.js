import express from 'express';
import { getAllPatients } from '../controllers/adminController.js';

const router = express.Router();

router.get('/all-patients', getAllPatients);

export default router;

import express from 'express';
import { registerDoctor, loginDoctor } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);

export default router;
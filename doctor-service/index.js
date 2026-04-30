import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { setServers } from "node:dns/promises";

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js'; // 🆕 අලුතින් එකතු කළ අංශය

// Resolve DNS issues
setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// 1. MIDDLEWARE MUST COME FIRST
app.use(express.json());
app.use(cors());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Doctor Service is running...');
});

// 2. ROUTES MUST COME SECOND
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes); // 🆕 Doctors related routes

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;

// Database Connection & Server Start
mongoose.connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log('✅ Doctor Service: Connected to MongoDB');
    // 0.0.0.0 prevents localhost Postman bugs
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Doctor Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Doctor Service DB Connection Error:', error.message);
  });
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { setServers } from "node:dns/promises";
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import appointmentRoutes from './routes/appointmentRoutes.js';

// Resolve DNS issues
setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded medical reports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base Route
app.get('/', (req, res) => {
  res.send('Appointment Engine Service is running...');
});

// Use Routes
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI;

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Appointment Service: Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Appointment Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Appointment DB Connection Error:', error.message);
  });
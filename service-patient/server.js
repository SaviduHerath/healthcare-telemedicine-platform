import uploadRoutes from './routes/uploadRoutes.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { setServers } from "node:dns/promises";
import patientRoutes from './routes/patientRoutes.js';
import path from 'path';


setServers(["1.1.1.1", "8.8.8.8"]);

// Initialize dotenv to read the .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Tell the app to use your patient routes
app.use('/api/patients', patientRoutes);
app.use('/api/patients', uploadRoutes);

const __dirname = path.resolve(); 
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to Patient Database successfully!'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Patient Service is running!');
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Patient Service running on port ${PORT}`);
});
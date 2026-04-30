import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// Database Connection & Server Start
mongoose.connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log('✅ Patient Service: Connected to MongoDB');
    // Using 0.0.0.0 prevents localhost connection refusal bugs
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Patient Service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Patient Service DB Connection Error:', error.message);
  });
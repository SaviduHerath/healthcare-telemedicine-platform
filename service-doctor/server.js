import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorRoutes from './routes/doctorRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/doctors', doctorRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Doctor Service is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to Doctor Database successfully!'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`⚕️  Doctor Service running on port ${PORT}`);
});
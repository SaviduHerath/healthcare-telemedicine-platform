import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Admin Service is running...');
});

app.use('/api/admin', adminRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to Admin Database successfully!'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`🛡️  Admin Service running on port ${PORT}`);
});
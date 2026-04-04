import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import appointmentRoutes from './routes/appointmentRoutes.js';
import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/appointments', appointmentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to Appointment DB!'))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`📅 Appointment Service running on Port ${PORT}`));
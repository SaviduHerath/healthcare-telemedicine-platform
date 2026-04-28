import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import paymentRoutes from './routes/paymentRoutes.js';
import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// Increase payload size limit for base64 encoded images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// Mount the routes
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5009;

mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(() => {
        console.log("✅ Payment Database Connected");
        app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));
    })
    .catch(err => console.error("❌ DB Connection Error:", err));
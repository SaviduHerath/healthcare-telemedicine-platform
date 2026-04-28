const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const symptomRoutes = require('./routes/symptomRoutes');
const { setServers } = require("node:dns/promises");

setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/symptoms', symptomRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`AI Service running on port ${PORT}`));
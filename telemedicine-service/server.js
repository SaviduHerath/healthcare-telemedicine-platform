const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const telemedicineRoutes = require("./routes/telemedicineRoutes");
const { setServers } = require("node:dns/promises");

setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/telemedicine", telemedicineRoutes);

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Telemedicine Service connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Telemedicine Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Telemedicine Service DB connection error:", err.message);
    process.exit(1);
  });
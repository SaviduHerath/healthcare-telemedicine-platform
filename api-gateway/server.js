require("dotenv").config();
const express = require("express");
const cors = require("cors");

const telemedicineProxy = require("./routes/telemedicineProxy");
const patientProxy = require("./routes/patientProxy");
const doctorProxy = require("./routes/doctorProxy");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", patientProxy);
app.use("/api/doctors", doctorProxy);
app.use("/api/telemedicine", telemedicineProxy);

app.get("/", (req, res) => {
  res.send("API Gateway Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
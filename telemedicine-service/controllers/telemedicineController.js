const Session = require("../models/Sessions");
const axios = require("axios");
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5002";
const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || "http://localhost:5001";

// Create a new telemedicine session
exports.createSession = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      date,
      time,
      meetingLink,
      status,
    } = req.body;

    // validations
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        message: "patientId, doctorId, date, and time are required",
      });
    }

    const newSession = new Session({
      patientId,
      patientName: patientName || "Unknown Patient", // Save patient name
      doctorId,
      date,
      time,
      meetingLink: meetingLink || "",
      status: status || "pending",
    });

    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: err.message });
  }
};

//Update Session Status
exports.updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting { status: "approved" } or "declined"

    const allowedStatuses = ["pending", "approved", "declined", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedSession = await Session.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' } // Mongoose 8+: replaces deprecated { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(updatedSession);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all sessions (appointments)
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1, time: 1 });
    res.status(200).json({ sessions });
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get sessions by patient ID
exports.getSessionsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    const sessions = await Session.find({ patientId })
      .populate("doctorId", "fullName specialization")
      .sort({ date: 1 });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error("Get sessions by patient error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get doctors (via external service)
exports.getDoctors = async (req, res) => {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/api/admin/all-doctors`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Doctor service error:", err.message);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// Get patients (via external service)
exports.getPatients = async (req, res) => {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/api/admin/all-patients`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Patient service error:", err.message);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};
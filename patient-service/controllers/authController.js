import Patient from '../models/Patient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// NEW: Login Function
export const loginPatient = async (req, res) => {
  try {

    console.log("👀 CONTENT-TYPE HEADER:", req.headers['content-type']);
    console.log("📦 RAW BODY RECEIVED:", req.body);

    const { email, password } = req.body;

    // 1. Check if patient exists
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // 2. Validate password
    const isPasswordCorrect = await bcrypt.compare(password, patient.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 3. Generate a JWT Token
    const token = jwt.sign(
      { id: patient._id, role: patient.role, email: patient.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // 4. Send success response with token
    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: patient._id,
        fullName: patient.fullName,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        role: patient.role
      }
    });

  } catch (error) {
    console.error("💥 LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};


export const registerPatient = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, nic, bloodGroup, allergies, gender, dateOfBirth } = req.body;

    // Check if user already exists
    const existingPatient = await Patient.findOne({ $or: [{ email }, { nic }] });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient with this email or NIC already exists." });
    }

    // Create new patient
    const newPatient = new Patient({
      fullName, email, password, phoneNumber, nic, bloodGroup, allergies, gender, dateOfBirth
    });

    // Save to database
    await newPatient.save();

    // Send success response
    res.status(201).json({
      message: "Patient registered successfully.",
      user: { id: newPatient._id, email: newPatient.email, role: newPatient.role }
    });

  } catch (error) {
    console.error("💥 MONGOOSE ERROR:", error); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
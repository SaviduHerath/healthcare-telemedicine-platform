import Doctor from '../models/Doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// 1. REGISTER DOCTOR
export const registerDoctor = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, nic, specialization, medicalLicenseNumber } = req.body;

    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { nic }] });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor with this email or NIC already exists." });
    }

    const newDoctor = new Doctor({
      fullName, email, password, phoneNumber, nic, specialization, medicalLicenseNumber
    });

    await newDoctor.save();

    res.status(201).json({
      message: "Doctor registered successfully. Pending Admin approval.",
      user: { id: newDoctor._id, email: newDoctor.email, role: newDoctor.role }
    });

  } catch (error) {
    console.error("💥 MONGOOSE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. LOGIN DOCTOR
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, doctor.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!doctor.isApproved) {
      return res.status(403).json({ message: "Your account is pending Admin approval. You cannot log in yet." });
    }

    const token = jwt.sign(
      { id: doctor._id, role: doctor.role, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        role: doctor.role,
        isApproved: doctor.isApproved
      }
    });

  } catch (error) {
    console.error("💥 LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};
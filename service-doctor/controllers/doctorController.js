import Doctor from '../models/Doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new doctor
// @route   POST /api/doctors/register
// @access  Public
export const registerDoctor = async (req, res) => {
  const { name, email, password, specialization, experience, consultationFee } = req.body;

  try {
    // 1. Check if doctor already exists
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the doctor (Notice: isApproved defaults to false automatically)
    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      experience,
      consultationFee
    });

    if (doctor) {
      res.status(201).json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        isApproved: doctor.isApproved,
        token: generateToken(doctor._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid doctor data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate (Login) a doctor
// @route   POST /api/doctors/login
// @access  Public
export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });

    // Check if doctor exists AND passwords match
    if (doctor && (await bcrypt.compare(password, doctor.password))) {
      res.json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        isApproved: doctor.isApproved,
        token: generateToken(doctor._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private (Requires Doctor Token)
export const getDoctorProfile = async (req, res) => {
  const doctor = await Doctor.findById(req.doctor._id);
  if (doctor) {
    res.json(doctor);
  } else {
    res.status(404).json({ message: 'Doctor not found' });
  }
};

// @desc    Update doctor profile (fees, experience, etc.)
// @route   PUT /api/doctors/profile
// @access  Private (Requires Doctor Token)
export const updateDoctorProfile = async (req, res) => {
  const doctor = await Doctor.findById(req.doctor._id);

  if (doctor) {
    doctor.name = req.body.name || doctor.name;
    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.consultationFee = req.body.consultationFee || doctor.consultationFee;

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } else {
    res.status(404).json({ message: 'Doctor not found' });
  }
};

// @desc    Get all APPROVED doctors (For patients to view)
// @route   GET /api/doctors/approved
// @access  Public
export const getApprovedDoctors = async (req, res) => {
  try {
    // Only return doctors where isApproved is true
    const doctors = await Doctor.find({ isApproved: true }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

// @desc    Get all PENDING doctors (For Admin use)
// @route   GET /api/doctors/pending
export const getPendingDoctors = async (req, res) => {
  const doctors = await Doctor.find({ isApproved: false }).select('-password');
  res.json(doctors);
};

// @desc    Approve a doctor (For Admin use)
// @route   PUT /api/doctors/:id/approve
export const approveDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (doctor) {
    doctor.isApproved = true;
    await doctor.save();
    res.json({ message: 'Doctor approved successfully' });
  } else {
    res.status(404).json({ message: 'Doctor not found' });
  }
};
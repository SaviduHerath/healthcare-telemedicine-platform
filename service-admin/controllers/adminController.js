import jwt from 'jsonwebtoken';
import axios from 'axios';

// We will hardcode a master Admin login for simplicity
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@system.com' && password === 'admin123') {
    const token = jwt.sign({ role: 'SuperAdmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ email, role: 'SuperAdmin', token });
  } else {
    res.status(401).json({ message: 'Invalid Admin Credentials' });
  }
};

// Microservice Communication: Ask Doctor Service for pending doctors
export const fetchPendingDoctors = async (req, res) => {
  try {
    const response = await axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors/pending`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to communicate with Doctor Service' });
  }
};

// Microservice Communication: Tell Doctor Service to approve a doctor
export const approveDoctorAccount = async (req, res) => {
  try {
    await axios.put(`${process.env.DOCTOR_SERVICE_URL}/api/doctors/${req.params.id}/approve`);
    res.json({ message: 'Doctor successfully approved across the network!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve doctor in Doctor Service' });
  }
};
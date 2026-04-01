import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';

// @desc    Register a new patient
// @route   POST /api/patients/register
export const registerPatient = async (req, res) => {
  // ... (Keep all your existing register logic here exactly as it was) ...
  try {
    const { name, email, password, contactNumber } = req.body;
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) return res.status(400).json({ message: 'Patient with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({ name, email, password: hashedPassword, contactNumber });
    await newPatient.save();

    res.status(201).json({ message: 'Patient registered successfully!', patientId: newPatient._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a patient & get token
// @route   POST /api/patients/login
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the patient exists
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // 2. Check if the password matches the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, patient.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate the JWT Token
    // We store the patient's ID and role inside the token
    const token = jwt.sign(
      { id: patient._id, role: 'patient' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // 4. Send the token and user data back to the frontend
    res.status(200).json({
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get patient profile data
// @route   GET /api/patients/profile
// @access  Private (Requires Token)
export const getPatientProfile = async (req, res) => {
  try {
    // We get the ID from the token that the middleware just verified!
    const patient = await Patient.findById(req.patient.id).select('-password'); // Exclude the password from the result

    if (patient) {
      res.status(200).json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Requires Token)
export const updatePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient.id);

    if (patient) {
      // Update fields if they are provided in the request, otherwise keep the old ones
      patient.name = req.body.name || patient.name;
      patient.contactNumber = req.body.contactNumber || patient.contactNumber;
      
      // If the user sends a new medical condition, add it to the array
      if (req.body.newMedicalHistory) {
        patient.medicalHistory.push(req.body.newMedicalHistory);
      }

      // Save the updated patient
      const updatedPatient = await patient.save();

      res.status(200).json({
        message: 'Profile updated successfully',
        patient: {
          id: updatedPatient._id,
          name: updatedPatient.name,
          contactNumber: updatedPatient.contactNumber,
          medicalHistory: updatedPatient.medicalHistory
        }
      });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
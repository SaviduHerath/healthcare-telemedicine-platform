import Patient from '../models/Patient.js';

// GET ALL PATIENTS
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json(patients);
  } catch (error) {
    console.error("💥 ERROR FETCHING ALL PATIENTS:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

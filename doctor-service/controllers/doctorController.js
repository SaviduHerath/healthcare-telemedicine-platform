import Doctor from '../models/Doctor.js';

// 1. Search & Filter API (For Patients)
// GET /api/doctors/search?query=heart
export const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    
    // By default, only show approved doctors
    let filter = { isApproved: true }; 

    if (query) {
      const searchWord = query.toLowerCase();

      // Map common keywords to specializations
      const keywordMap = {
        'heart': 'cardiologist',
        'brain': 'neurologist',
        'skin': 'dermatologist',
        'bone': 'orthopedic',
        'child': 'pediatrician',
        'eye': 'ophthalmologist',
        'tooth': 'dentist'
      };

      const mappedSpecialization = keywordMap[searchWord] || searchWord;

      // Search by name or mapped specialization
      filter.$or = [
        { name: { $regex: searchWord, $options: 'i' } },
        { specialization: { $regex: mappedSpecialization, $options: 'i' } },
        { specialization: { $regex: searchWord, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(filter).select('-password'); // Hide password
    res.status(200).json(doctors);

  } catch (error) {
    res.status(500).json({ message: 'Error searching doctors', error: error.message });
  }
};

// 2. Update Profile (Bio, Fee, Picture)
// PUT /api/doctors/profile/:id
export const updateProfile = async (req, res) => {
  try {
    const { bio, consultationFee, profilePicture } = req.body;
    const doctorId = req.params.id;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { bio, consultationFee, profilePicture },
      { returnDocument: 'after' } // Mongoose 8+: replaces deprecated { new: true }
    ).select('-password');

    if (!updatedDoctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({ message: 'Profile updated successfully', doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// 3. Set Availability (Working Hours)
// PUT /api/doctors/availability/:id
export const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body; // Array of { day, startTime, endTime }
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({ message: 'Availability updated successfully', availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};

// 4. Get Single Doctor Profile (Public View)
// GET /api/doctors/:id
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, isApproved: true }).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found or not approved' });
    
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor', error: error.message });
  }
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // FIX 1: Imported axios
import doctorAPI from '../services/doctorApi';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [fee, setFee] = useState('');
  const [experience, setExperience] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [appointments, setAppointments] = useState([]);

  // FIX 2: Renamed this variable to 'localDoctor' so it doesn't conflict with the 'doctor' state above
  const localDoctor = JSON.parse(localStorage.getItem('doctorData'));

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Updated to use localDoctor.id
        const res = await axios.get(`http://localhost:5004/api/appointments/doctor/${localDoctor.id}`);
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to load schedule");
      }
    };
    // Updated to use localDoctor.id
    if (localDoctor?.id) fetchSchedule();
  }, [localDoctor?.id]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.get('/profile');
      setDoctor(response.data);
      setFee(response.data.consultationFee);
      setExperience(response.data.experience);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg({ text: 'Updating...', type: 'info' });
    try {
      await doctorAPI.put('/profile', { consultationFee: fee, experience });
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      fetchProfile();
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setMsg({ text: 'Update failed.', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData'); // Ensure this matches what you use to login
    navigate('/doctor/login');
  };

  if (!doctor) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-between items-center border-t-4 border-t-teal-500">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Dr. {doctor.name}</h1>
            <p className="text-slate-500 mt-1">{doctor.specialization} Specialist</p>
          </div>
          <button onClick={handleLogout} className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold py-2 px-4 rounded-lg transition">
            Sign Out
          </button>
        </div>

        {/* Status Banner */}
        {!doctor.isApproved ? (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
            <h3 className="text-amber-800 font-bold">Account Pending Approval</h3>
            <p className="text-amber-700 text-sm mt-1">You cannot receive appointments until an Administrator verifies your credentials.</p>
          </div>
        ) : (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm">
            <h3 className="text-emerald-800 font-bold">Account Active</h3>
            <p className="text-emerald-700 text-sm mt-1">Your profile is visible to patients.</p>
          </div>
        )}

        {/* Update Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Practice Settings</h2>
          
          {msg.text && (
            <div className={`p-3 rounded mb-4 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-teal-50 text-teal-700'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
              <input 
                type="number" value={experience} onChange={(e) => setExperience(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee ($)</label>
              <input 
                type="number" value={fee} onChange={(e) => setFee(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition">
              Update Practice Details
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
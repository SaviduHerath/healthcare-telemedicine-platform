import React, { useState, useEffect } from 'react';
import { getDoctorProfile, updateDoctorProfile, updateDoctorAvailability } from '../../api/doctorService';

const DoctorProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = storedUser.id || storedUser._id;
  
  const [profile, setProfile] = useState({
    bio: '',
    consultationFee: '',
    specialization: ''
  });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ message: '', type: '' });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDoctorProfile(doctorId);
        setProfile({
          bio: data.bio || '',
          consultationFee: data.consultationFee || '',
          specialization: data.specialization || ''
        });
        setAvailability(data.availability || []);
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [doctorId]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    const exists = availability.find(a => a.day === day);
    if (exists) {
      setAvailability(availability.filter(a => a.day !== day));
    } else {
      setAvailability([...availability, { day, startTime: '09:00 AM', endTime: '05:00 PM' }]);
    }
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability(availability.map(a => 
      a.day === day ? { ...a, [field]: value } : a
    ));
  };

  const saveSettings = async () => {
    setSaving(true);
    setAlertInfo({ message: '', type: '' });
    try {
      await updateDoctorProfile(doctorId, profile);
      await updateDoctorAvailability(doctorId, availability);
      setAlertInfo({ message: 'Profile and Availability updated successfully!', type: 'success' });
    } catch (err) {
      setAlertInfo({ message: 'Failed to update settings.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setAlertInfo({ message: '', type: '' }), 4000);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Profile Settings</h1>

      {alertInfo.message && (
        <div className={`p-4 rounded-xl mb-6 shadow-sm ${alertInfo.type === 'success' ? 'bg-green-50 text-green-800 border bg-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {alertInfo.message}
        </div>
      )}

      {/* Basic Profile Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Basic Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Professional Bio</label>
            <textarea 
              name="bio"
              rows={4}
              value={profile.bio}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-slate-900"
              placeholder="Tell patients about your experience, expertise, and care philosophy..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Fee (Rs.)</label>
               <input 
                 type="number" 
                 name="consultationFee"
                 value={profile.consultationFee}
                 onChange={handleProfileChange}
                 className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-slate-900"
                 placeholder="e.g. 1500"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Specialization (Read Only)</label>
               <input 
                 type="text" 
                 value={profile.specialization}
                 disabled
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Availability Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Working Hours</h2>
          <span className="text-sm text-slate-500">Select days you are available</span>
        </div>
        <div className="p-6">
          <div className="divide-y divide-slate-100">
            {daysOfWeek.map(day => {
              const isSelected = availability.find(a => a.day === day);
              return (
                <div key={day} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`day-${day}`}
                      checked={!!isSelected}
                      onChange={() => toggleDay(day)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`day-${day}`} className="ml-3 text-base font-medium text-slate-700 w-28">
                      {day}
                    </label>
                  </div>
                  
                  {isSelected && (
                    <div className="flex items-center gap-2 pl-8 sm:pl-0">
                      <select 
                        value={isSelected.startTime}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      >
                         <option value="08:00 AM">08:00 AM</option>
                         <option value="09:00 AM">09:00 AM</option>
                         <option value="10:00 AM">10:00 AM</option>
                         <option value="11:00 AM">11:00 AM</option>
                      </select>
                      <span className="text-slate-500">to</span>
                      <select 
                        value={isSelected.endTime}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      >
                         <option value="01:00 PM">01:00 PM</option>
                         <option value="03:00 PM">03:00 PM</option>
                         <option value="05:00 PM">05:00 PM</option>
                         <option value="08:00 PM">08:00 PM</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button 
          onClick={saveSettings}
          disabled={saving}
          className={`px-8 py-4 rounded-xl font-bold text-white text-lg shadow-sm transition-all focus:ring-4 focus:ring-blue-200 cursor-pointer ${
            saving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
          }`}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default DoctorProfileSettings;

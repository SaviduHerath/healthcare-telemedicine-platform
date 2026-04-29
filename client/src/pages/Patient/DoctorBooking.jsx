import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../../api/doctorService';
import { getAvailableSlots, bookAppointment } from '../../api/appointmentService';

const DoctorBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch patient data from localStorage Auth session
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const patientData = { 
    id: storedUser._id || storedUser.email || 'guest_123', 
    name: storedUser.fullName || 'Guest Patient' 
  };
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingStatus, setBookingStatus] = useState({ loading: false, success: false, error: null });
  const [medicalReports, setMedicalReports] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorProfile(id);
        setDoctor(data);
      } catch (err) {
        setError('Doctor not found or error loading profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;
      setSlotsLoading(true);
      try {
        const data = await getAvailableSlots(id, selectedDate);
        setAvailableSlots(data.availableSlots || []);
        setSelectedSlot('');
      } catch (err) {
        console.error('Failed to fetch slots');
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate, doctor]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    setBookingStatus({ loading: true, success: false, error: null });
    
    try {
      // 1. Create the appointment record in Appointment Service
      const formData = new FormData();
      formData.append('patientId', patientData.id);
      formData.append('patientName', patientData.name);
      formData.append('patientEmail', storedUser.email || 'patient@healthcare.com');
      formData.append('patientPhone', storedUser.phoneNumber || storedUser.phone || '');
      formData.append('doctorId', doctor._id);
      formData.append('doctorName', doctor.fullName || doctor.name || 'Doctor');
      formData.append('doctorEmail', doctor.email || '');
      formData.append('doctorPhone', doctor.phoneNumber || doctor.phone || '');
      formData.append('date', selectedDate);
      formData.append('timeSlot', selectedSlot);
      formData.append('consultationFee', doctor.consultationFee || 1500);
      medicalReports.forEach((file) => formData.append('medicalReports', file));

      await bookAppointment(formData);

      // 2. Update UI state
      setBookingStatus({ loading: false, success: true, error: null });
      
      // Refresh slots
      const slotData = await getAvailableSlots(id, selectedDate);
      setAvailableSlots(slotData.availableSlots || []);
      setSelectedSlot('');
      setMedicalReports([]);
      
    } catch (err) {
      setBookingStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.message || 'Failed to book appointment' 
      });
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !doctor) return <div className="text-center p-20 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <button onClick={() => navigate('/find-doctor')} className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to search
      </button>

      {bookingStatus.success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-8 shadow-sm animate-pulse">
          <div className="flex items-center gap-3 text-green-800">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <h3 className="font-bold text-lg">Appointment Confirmed!</h3>
          </div>
          <p className="mt-2 text-green-700 ml-9">Check your email for confirmation. Your booking is pending doctor's approval.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 md:flex md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{doctor.fullName || doctor.name}</h1>
            <p className="text-blue-600 font-semibold text-lg capitalize mt-1 mb-4">{doctor.specialization}</p>
            <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">{doctor.bio || 'Experienced medical professional dedicated to providing compassionate care.'}</p>
            
            <div className="grid grid-cols-2 max-w-md gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <span className="block text-sm text-slate-500 mb-1">Consultation Fee</span>
                <span className="text-lg font-bold text-slate-900">Rs. {doctor.consultationFee || '1500'}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <span className="block text-sm text-slate-500 mb-1">Experience</span>
                <span className="text-lg font-bold text-slate-900">10+ Years</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 md:ml-8 flex flex-col items-center justify-center p-6 bg-indigo-50 rounded-full h-32 w-32 border-4 border-white shadow-md">
            <span className="text-indigo-600 font-bold text-5xl">{(doctor.fullName || doctor.name || 'D').charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Select Date & Time</h2>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">Choose Date</label>
          <input 
            type="date" 
            min={new Date().toISOString().split('T')[0]} 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-64 px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-4">Available Time Slots</label>
          
          {slotsLoading ? (
            <div className="flex mt-4 space-x-2">
              <div className="h-4 w-4 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce delay-150"></div>
              <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce delay-300"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedSlot === slot 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-xl text-center text-slate-500">
              No slots available for this date. Please choose another date.
            </div>
          )}
        </div>

        <div className="mt-10">
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload your medical reports (optional)</label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setMedicalReports(Array.from(e.target.files || []))}
              className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700"
            />
            <div className="mt-3 text-xs text-slate-500">
              Supported: PDF, PNG, JPG. Max 5 files, 10MB each.
            </div>
            {medicalReports.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Selected files</p>
                <ul className="space-y-1">
                  {medicalReports.map((f) => (
                    <li key={`${f.name}-${f.size}`} className="text-xs text-slate-600 flex items-center justify-between">
                      <span className="truncate">{f.name}</span>
                      <span className="ml-3 text-slate-400">{Math.ceil(f.size / 1024)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {bookingStatus.error && (
          <div className="mt-6 text-red-600 text-sm font-medium p-3 bg-red-50 rounded-lg">
            {bookingStatus.error}
          </div>
        )}

        <div className="mt-10 border-t border-slate-100 pt-8 flex justify-end">
          <button 
            disabled={!selectedSlot || bookingStatus.loading}
            onClick={handleBook}
            className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-sm ${
              !selectedSlot || bookingStatus.loading 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer'
            }`}
          >
            {bookingStatus.loading ? 'Processing...' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorBooking;
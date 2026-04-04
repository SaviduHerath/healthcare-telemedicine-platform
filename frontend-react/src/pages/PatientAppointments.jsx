import React, { useState, useEffect } from 'react';
import axios from 'axios'; // We use standard axios here to call the Doctor service directly

const PatientAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');

  // 1. Fetch Approved Doctors from the Doctor Service (Port 5002)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/doctors/approved');
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Handle the Booking Action
  const submitBooking = async (e) => {
    e.preventDefault();
    // Later, this will send a POST request to the Appointment Service (Port 5004)
    alert(`Mock Booking Successful!\nDoctor: ${bookingModal.name}\nDate: ${appointmentDate}\n\nWaiting for Port 5004 backend to be built!`);
    setBookingModal(null);
    setAppointmentDate('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Book a Consultation</h2>
      
      {loading ? <p>Loading available doctors...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <div key={doc._id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Dr. {doc.name}</h3>
                <p className="text-sm text-slate-500">{doc.specialization} • {doc.experience} Yrs Exp.</p>
                <p className="text-blue-600 font-semibold mt-1">Fee: ${doc.consultationFee}</p>
              </div>
              <button 
                onClick={() => setBookingModal(doc)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm"
              >
                Book
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up Modal for Booking */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Book with Dr. {bookingModal.name}</h3>
            <form onSubmit={submitBooking}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setBookingModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
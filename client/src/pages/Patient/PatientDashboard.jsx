import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPatientAppointments, 
  deleteAppointment, 
  updatePatientAppointment,
  getAvailableSlots 
} from '../../api/appointmentService';
import { createPaymentCheckout } from '../../api/paymentService';
import PaymentModal from '../../components/PaymentModal';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [rescheduleData, setRescheduleData] = useState({ activeId: null, date: '', slots: [], selectedSlot: '', loadingSlots: false });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, appointment: null });

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = storedUser._id || storedUser.email;

  useEffect(() => {
    if (!patientId) {
      navigate('/login');
      return;
    }
    fetchMyAppointments();
  }, [patientId, navigate]);

  const fetchMyAppointments = async () => {
    setLoading(true);
    try {
      const data = await getPatientAppointments(patientId);
      setAppointments(data || []);
    } catch (err) {
      setError('Unable to load your appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await deleteAppointment(id);
        fetchMyAppointments();
      } catch (err) {
        alert("Failed to cancel appointment.");
      }
    }
  };

  const handleRescheduleClick = (appt) => {
    if (rescheduleData.activeId === appt._id) {
      setRescheduleData({ activeId: null, date: '', slots: [], selectedSlot: '', loadingSlots: false });
    } else {
      setRescheduleData({ activeId: appt._id, date: appt.date, slots: [], selectedSlot: '', loadingSlots: false, doctorId: appt.doctorId });
    }
  };

  useEffect(() => {
    const fetchSlotsForReschedule = async () => {
      if (!rescheduleData.activeId || !rescheduleData.date || !rescheduleData.doctorId) return;
      setRescheduleData(prev => ({ ...prev, loadingSlots: true }));
      try {
        const slotData = await getAvailableSlots(rescheduleData.doctorId, rescheduleData.date);
        setRescheduleData(prev => ({ ...prev, slots: slotData.availableSlots || [], selectedSlot: '', loadingSlots: false }));
      } catch (err) {
        setRescheduleData(prev => ({ ...prev, loadingSlots: false, slots: [] }));
      }
    };
    fetchSlotsForReschedule();
  }, [rescheduleData.date, rescheduleData.activeId, rescheduleData.doctorId]);

  const submitReschedule = async () => {
    if (!rescheduleData.selectedSlot) return;
    try {
      await updatePatientAppointment(rescheduleData.activeId, {
        date: rescheduleData.date,
        timeSlot: rescheduleData.selectedSlot
      });
      alert('Appointment rescheduled safely!');
      setRescheduleData({ activeId: null, date: '', slots: [], selectedSlot: '', loadingSlots: false });
      fetchMyAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    }
  };

  const handlePayment = (appt) => {
    setPaymentModal({ isOpen: true, appointment: appt });
  };

  const handlePaymentSuccess = () => {
    fetchMyAppointments();
  };

  const isAppointmentToday = (appointmentDate) => {
    const today = new Date().toISOString().split('T')[0];
    return appointmentDate === today;
  };

  // Updated Navigation to Telemedicine
  const handleVideoCall = (appt) => {
    if (appt.status === 'Paid' || appt.status === 'Completed') {
      const roomName = `appointment-${appt._id}`;
      // Navigating to /telemedicine as requested
      navigate('/telemedicine', { 
        state: { 
          roomName, 
          appointment: appt,
          doctorName: appt.doctorName,
          patientName: appt.patientName
        } 
      });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-br from-slate-50 to-blue-50 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{storedUser.fullName || "Patient"}</span>
          </h1>
          <p className="text-slate-600 mt-2">Manage your appointments and stay on top of your health journey.</p>
        </div>
        <button onClick={() => navigate("/find-doctor")} className="group inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md">
          <span className="mr-2 text-xl group-hover:scale-110 transition">+</span> Book Appointment
        </button>
      </div>

      {error ? (
        <div className="text-red-500 bg-red-50 p-4 border rounded-lg">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 text-center shadow-sm border border-slate-100 rounded-xl">
          <h3 className="text-lg font-medium text-slate-900">No appointments yet</h3>
        </div>
      ) : (
        <div className="grid gap-6">
          {appointments.map(appt => (
            <div key={appt._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                
                {/* Info Block */}
                <div className="flex items-center gap-4 min-w-[250px]">
                  <div className="bg-blue-50 p-3 rounded-lg text-center w-20 border border-blue-100 shrink-0">
                    <div className="text-xs font-bold uppercase text-blue-600 mb-1">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-2xl font-black text-slate-800 leading-none">{new Date(appt.date).getDate()}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Dr. {appt.doctorName}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {appt.timeSlot}
                    </div>
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center gap-4 flex-1 justify-end">
                  
                  {/* Status and Reschedule/Cancel */}
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      appt.status === 'Declined' ? 'bg-red-100 text-red-800' :
                      appt.status === 'Paid' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appt.status.toUpperCase()}
                    </span>
                    {appt.status !== 'Completed' && appt.status !== 'Declined' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRescheduleClick(appt)} className="text-xs font-medium text-slate-600 hover:text-blue-600 underline">Reschedule</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleCancelClick(appt._id)} className="text-xs font-medium text-red-500 hover:text-red-700 underline">Cancel</button>
                      </div>
                    )}
                  </div>

                  {/* Fee */}
                  <div className="hidden sm:block border-l border-slate-200 h-10 mx-2"></div>
                  <div className="text-left sm:text-right min-w-[100px]">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Fee</p>
                    <p className="text-lg font-bold text-slate-800">Rs. {appt.consultationFee || 1500}</p>
                  </div>

                  {/* Main Action Buttons - FIXED SIZES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
                    {/* Payment Button */}
                    {appt.status !== 'Completed' && appt.status !== 'Paid' ? (
                      <button 
                        onClick={() => handlePayment(appt)}
                        className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pay Fee
                      </button>
                    ) : (
                      <div className="h-11 px-4 bg-slate-100 text-slate-500 border border-slate-200 font-bold rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Paid
                      </div>
                    )}
                    
                    {/* Video Call Button */}
                    <button 
                      onClick={() => handleVideoCall(appt)}
                      disabled={appt.status !== 'Paid' && appt.status !== 'Completed'}
                      className={`h-11 px-4 font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2 text-sm ${
                        appt.status === 'Paid' || appt.status === 'Completed'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title={isAppointmentToday(appt.date) ? 'Join video consultation' : 'Available on appointment date'}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Video Call
                    </button>
                  </div>

                </div>
              </div>

              {/* Reschedule Drawer */}
              {rescheduleData.activeId === appt._id && (
                <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Pick a new date and time</h4>
                  <div className="flex flex-col md:flex-row gap-6">
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                      className="w-full md:w-56 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      {rescheduleData.loadingSlots ? (
                        <div className="text-slate-500 text-sm">Loading slots...</div>
                      ) : rescheduleData.slots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {rescheduleData.slots.map(s => (
                            <button
                              key={s}
                              onClick={() => setRescheduleData({...rescheduleData, selectedSlot: s})}
                              className={`py-2 text-xs font-medium rounded border transition ${
                                rescheduleData.selectedSlot === s 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-sm italic">No slots available for this date.</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setRescheduleData({ activeId: null })} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
                    <button 
                      disabled={!rescheduleData.selectedSlot}
                      onClick={submitReschedule}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition"
                    >
                      Confirm Reschedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <PaymentModal 
        appointment={paymentModal.appointment}
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, appointment: null })}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PatientDashboard;
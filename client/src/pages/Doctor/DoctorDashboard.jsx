import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { getDoctorAppointments, updateAppointmentStatus } from '../../api/appointmentService';
import { getAppointmentRoomName } from '../../utils/telemedicineRoom';

const DoctorDashboard = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = storedUser.id || storedUser._id;
  const doctorName = storedUser.fullName || "Doctor";
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completeModal, setCompleteModal] = useState({ isOpen: false, appointment: null, note: '', saving: false });

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAppointments(doctorId);
      setAppointments(data || []);
    } catch (err) {
      setError('Failed to fetch appointments. Ensure Appointment Service is running.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Navigation handler for Video Call
  const handleVideoCall = (appt) => {
    // We use the same room naming logic as the Patient Dashboard
    const roomName = getAppointmentRoomName(appt._id);
    navigate('/telemedicine', { 
      state: { 
        roomName, 
        appointment: appt,
        doctorName: doctorName,
        patientName: appt.patientName
      } 
    });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const appt = appointments.find(a => a._id === id);
      if (!appt) return;

      await updateAppointmentStatus(id, newStatus);

      setAppointments(appointments.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));

    } catch (err) {
      console.error(err);
      alert('Failed to update status. Please try again.');
    }
  };

  const openCompleteModal = (appt) => {
    setCompleteModal({ isOpen: true, appointment: appt, note: appt.doctorCompletionNote || '', saving: false });
  };

  const submitCompletion = async () => {
    if (!completeModal.appointment) return;

    setCompleteModal(prev => ({ ...prev, saving: true }));
    try {
      const res = await updateAppointmentStatus(
        completeModal.appointment._id,
        'Completed',
        completeModal.note
      );

      setAppointments(prev => prev.map(app =>
        app._id === completeModal.appointment._id ? res.appointment : app
      ));
      setCompleteModal({ isOpen: false, appointment: null, note: '', saving: false });
    } catch (err) {
      alert('Failed to mark appointment as completed.');
      setCompleteModal(prev => ({ ...prev, saving: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Accepted': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold shadow-sm ring-1 ring-green-200">ACCEPTED</span>;
      case 'Declined': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold shadow-sm ring-1 ring-red-200">DECLINED</span>;
      case 'Completed': return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold shadow-sm ring-1 ring-slate-200">COMPLETED</span>;
      case 'Paid': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold shadow-sm ring-1 ring-blue-200">PAID</span>;
      default: return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold shadow-sm ring-1 ring-yellow-200">PENDING</span>;
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.date === todayDate);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your appointments and patient queue</p>
        </div>
        <button 
          onClick={fetchAppointments}
          className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Today's Appointments</p>
            <p className="text-3xl font-bold text-slate-900">{todaysAppointments.length}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600">{appointments.filter(a => a.status === 'Pending').length}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Patients</p>
            <p className="text-3xl font-bold text-green-600">{new Set(appointments.map(a => a.patientId)).size}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Your Schedule</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading your schedule...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900">No appointments found</h3>
            <p className="mt-1 text-slate-500">You don't have any appointments booked yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map(appt => (
              <div key={appt._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-700 font-bold text-center w-20 flex-shrink-0">
                    <div className="text-xs uppercase leading-none mb-1">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-2xl leading-none">{new Date(appt.date).getDate()}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{appt.patientName || 'Unknown Patient'}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {appt.timeSlot}
                      </span>
                      {getStatusBadge(appt.status)}
                    </div>
                    {appt.doctorCompletionNote && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Doctor Note</p>
                        <p className="text-sm text-emerald-800 whitespace-pre-wrap">{appt.doctorCompletionNote}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  {appt.status === 'Pending' && (
                    <>
                      {Array.isArray(appt.medicalReports) && appt.medicalReports.length > 0 && (
                        <button
                          onClick={() => window.open(appt.medicalReports[0].url, '_blank', 'noopener,noreferrer')}
                          className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          title={`View ${appt.medicalReports.length} uploaded report(s)`}
                        >
                          View Reports
                        </button>
                      )}
                      <button 
                        onClick={() => handleStatusUpdate(appt._id, 'Declined')}
                        className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(appt._id, 'Accepted')}
                        className="px-4 py-2 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                    </>
                  )}
                  
                  {/* UPDATED SECTION: Video Call and Mark Completed buttons for Accepted/Paid status */}
                  {(appt.status === 'Accepted' || appt.status === 'Paid') && (
                    <>
                      {Array.isArray(appt.medicalReports) && appt.medicalReports.length > 0 && (
                        <button
                          onClick={() => window.open(appt.medicalReports[0].url, '_blank', 'noopener,noreferrer')}
                          className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          title={`View ${appt.medicalReports.length} uploaded report(s)`}
                        >
                          View Reports
                        </button>
                      )}
                      <button 
                        onClick={() => handleVideoCall(appt)}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Start Video Call
                      </button>
                      
                      <button 
                        onClick={() => openCompleteModal(appt)}
                        className="px-4 py-2 border border-green-600 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Appointment</h3>
            <p className="text-sm text-slate-600 mb-4">
              Add a quick note for the patient. This note will be saved and emailed.
            </p>
            <textarea
              value={completeModal.note}
              onChange={(e) => setCompleteModal(prev => ({ ...prev, note: e.target.value }))}
              rows={5}
              placeholder="Write a short summary, advice, or follow-up note..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setCompleteModal({ isOpen: false, appointment: null, note: '', saving: false })}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                disabled={completeModal.saving}
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                disabled={completeModal.saving}
                className={`px-4 py-2 text-white rounded-lg ${completeModal.saving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {completeModal.saving ? 'Saving...' : 'Save & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
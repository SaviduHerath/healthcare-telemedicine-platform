import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import VideoConsultation from "./VideoConsultation";

const Telemedicine = () => {
  const location = useLocation();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPatient = loggedUser?.role === "Patient";

  const API_BASE = "http://localhost:5003/api/telemedicine";

  // 1. Catch data passed from the Patient Dashboard navigate()
  useEffect(() => {
    if (location.state && location.state.appointment) {
      const appt = location.state.appointment;
      
      setSelectedSession({
        _id: appt._id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        customRoomName: location.state.roomName, // From dashboard state
        doctorName: location.state.doctorName,   // From dashboard state
      });
    }
  }, [location.state]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Telemedicine <span className="text-blue-600">Portal</span>
        </h1>
        <p className="text-slate-500 mt-2">Secure video consultation with your healthcare provider</p>
      </div>

      {/* --- VIDEO SECTION --- */}
      <div className="max-w-7xl mx-auto">
        {!selectedSession ? (
          /* Placeholder when no session is active */
          <div className="bg-white p-20 rounded-2xl border-2 border-dashed border-slate-200 text-center shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Active Call</h3>
            <p className="text-slate-500 mt-1">Select an appointment from your dashboard to start a video call.</p>
          </div>
        ) : (
          /* ACTIVE VIDEO CALL INTERFACE */
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[650px] md:h-[800px]">
            
            {/* Top Bar inside the video card */}
            <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <h2 className="font-bold text-slate-900 leading-none">
                    Live Consultation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    {selectedSession.doctorName ? `Dr. ${selectedSession.doctorName}` : `Room: ${selectedSession.customRoomName}`}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSession(null)} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
              >
                End Call
              </button>
            </div>
            
            {/* Video Container - This fills all remaining vertical space */}
            <div className="flex-1 w-full bg-slate-900 relative">
              <VideoConsultation
                roomName={selectedSession.customRoomName || `session-${selectedSession._id}`}
                userName={loggedUser?.fullName || "Patient"}
              />
              
              {/* Optional Overlay Info */}
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                   <p className="text-white text-[10px] font-medium opacity-80 uppercase tracking-widest">Secure Connection Active</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="max-w-7xl mx-auto mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Having trouble? Ensure your camera and microphone permissions are enabled in your browser settings.
        </p>
      </div>
    </div>
  );
};

export default Telemedicine;
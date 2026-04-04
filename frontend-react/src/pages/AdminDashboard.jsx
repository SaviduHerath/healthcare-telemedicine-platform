import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../services/adminApi';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      const res = await adminAPI.get('/doctors/pending');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.put(`/doctors/approve/${id}`);
      fetchPending(); // Refresh the list
    } catch (err) {
      alert('Failed to approve doctor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-slate-900 rounded-xl shadow-lg p-6 flex justify-between items-center text-white">
          <h1 className="text-3xl font-extrabold text-indigo-400">Admin Command Center</h1>
          <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-lg font-semibold">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Doctor Approvals</h2>
          
          {doctors.length === 0 ? (
            <p className="text-slate-500">No pending doctors at this time.</p>
          ) : (
            <div className="space-y-4">
              {doctors.map(doc => (
                <div key={doc._id} className="flex items-center justify-between p-4 border border-indigo-100 bg-indigo-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-indigo-900">{doc.name}</h3>
                    <p className="text-sm text-indigo-700">{doc.specialization} • {doc.experience} Years Exp. • {doc.email}</p>
                  </div>
                  <button 
                    onClick={() => handleApprove(doc._id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow-sm transition"
                  >
                    Approve Credentials
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
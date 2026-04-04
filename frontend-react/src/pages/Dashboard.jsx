import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // State for Profile Update
  const [contactNumber, setContactNumber] = useState('');
  const [newMedicalHistory, setNewMedicalHistory] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

  // State for File Upload
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({ text: '', type: '' });

  // The base URL of your backend to display the uploaded files
  const BACKEND_URL = 'http://localhost:5001';

  // Fetch the latest profile data when the dashboard loads
  const fetchProfile = async () => {
    try {
      const response = await API.get('/profile');
      setPatient(response.data);
      setContactNumber(response.data.contactNumber || '');
    } catch (err) {
      console.error("Failed to fetch profile", err);
      if (err.response?.status === 401) handleLogout(); // Kick them out if token is expired
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg({ text: 'Updating...', type: 'info' });
    try {
      await API.put('/profile', { contactNumber, newMedicalHistory });
      setUpdateMsg({ text: 'Profile updated successfully!', type: 'success' });
      setNewMedicalHistory(''); // Clear the input
      fetchProfile(); // Refresh the data
      setTimeout(() => setUpdateMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setUpdateMsg({ text: 'Failed to update profile.', type: 'error' });
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMsg({ text: 'Please select a file first.', type: 'error' });
      return;
    }

    // When sending files, we MUST use FormData, not standard JSON
    const formData = new FormData();
    formData.append('report', file);

    setUploadMsg({ text: 'Uploading...', type: 'info' });
    try {
      // Let Axios set Content-Type (includes multipart boundary). A bare
      // 'multipart/form-data' header breaks file parsing on the server.
      await API.post('/upload', formData);
      setUploadMsg({ text: 'File uploaded successfully!', type: 'success' });
      setFile(null); // Clear the file input
      fetchProfile(); // Refresh the data to show the new file
      setTimeout(() => setUploadMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      const data = err.response?.data;
      let text = 'Failed to upload file.';
      if (typeof data === 'string' && data.includes('Cannot POST')) {
        text =
          'Upload route not found. Stop any old node process on port 5001, then run npm start in folder service-patient.';
      } else if (data?.message) {
        text = data.message;
      }
      setUploadMsg({ text, type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
    navigate('/login');
  };

  if (!patient) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {patient.name}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg transition duration-150">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Update Profile Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Profile</h2>
            
            {updateMsg.text && (
              <div className={`p-3 rounded mb-4 text-sm ${updateMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {updateMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 0771234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Medical History</label>
                <textarea 
                  value={newMedicalHistory} 
                  onChange={(e) => setNewMedicalHistory(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Diagnosed with Asthma (2024)"
                  rows="3"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150">
                Save Changes
              </button>
            </form>

            {/* Display existing medical history */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Current History</h3>
              {patient.medicalHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No medical history recorded yet.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {patient.medicalHistory.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: File Upload Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Medical Reports</h2>

            {uploadMsg.text && (
              <div className={`p-3 rounded mb-4 text-sm ${uploadMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {uploadMsg.text}
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File (PDF or Image)</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150">
                Upload File
              </button>
            </form>

            {/* Display existing files */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Your Documents</h3>
              {patient.uploadedReports.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {patient.uploadedReports.map((filePath, index) => {
                    // Extract just the filename for a cleaner display
                    const fileName = filePath.split('/').pop();
                    return (
                      <a 
                        key={index} 
                        href={`${BACKEND_URL}${filePath}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block px-4 py-3 border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition duration-150 truncate"
                      >
                        📄 {fileName}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
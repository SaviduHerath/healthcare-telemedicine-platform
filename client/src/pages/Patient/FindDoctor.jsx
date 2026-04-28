import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDoctors } from '../../api/doctorService';

const FindDoctor = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchDoctors(searchQuery);
      setDoctors(data);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Find a Specialist</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">Search for doctors by name, specialty, or condition (e.g., heart, brain, child) to get the best care possible.</p>
        
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative flex items-center">
          <input
            type="text"
            className="w-full pl-5 pr-12 py-4 rounded-full border-0 ring-1 ring-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 text-lg transition-all"
            placeholder="Search specialties, conditions, or names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="text-center py-20">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900">No doctors found</h3>
          <p className="mt-1 text-slate-500">Try adjusting your search criteria.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow ">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold shadow-sm">
                  {(doctor.fullName || doctor.name) ? (doctor.fullName || doctor.name).charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{doctor.fullName || doctor.name}</h2>
                  <p className="text-blue-600 font-medium capitalize">{doctor.specialization}</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4">{doctor.bio || 'Experienced medical professional dedicated to providing compassionate care.'}</p>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {doctor.availability?.length > 0 ? doctor.availability.map(a => a.day).join(', ') : 'Check schedule'}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Rs. {doctor.consultationFee || 1500} Consultation Fee
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => navigate(`/book-doctor/${doctor._id}`)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindDoctor;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = storedUser.role;

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-600 hover:text-white";
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-white text-xl font-bold tracking-tight">WellCare</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                
                {/* Patient Links */}
                {(role === 'Patient' || !role) && (
                  <>
                    <Link to="/patient-home" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/patient-home')}`}>
                      Dashboard
                    </Link>
                    <Link to="/find-doctor" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/find-doctor')}`}>
                      Find Doctor
                    </Link>
                    <Link to="/symptom-checker" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/symptom-checker')}`}>
                      Ask AI
                    </Link>
                    <Link to="/telemedicine" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/telemedicine')}`}>
                      Consulting
                    </Link>
                  </>
                )}

                {/* Doctor Links */}
                {(role === 'Doctor' || !role) && (
                  <>
                    <Link to="/doctor-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/doctor-dashboard')}`}>
                      Doctor Dashboard
                    </Link>
                    <Link to="/doctor-settings" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/doctor-settings')}`}>
                      Doctor Settings
                    </Link>
                    <Link to="/telemedicine" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/telemedicine')}`}>
                      Consulting
                    </Link>
                  </>
                )}
                
                {/* Admin Links */}
                {(role === 'Admin' || !role) && (
                  <Link to="/admin-maindashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/admin-maindashboard')}`}>
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-white text-sm mr-4 hidden md:block">
              {storedUser.fullName || storedUser.email}
            </span>
            <button 
              onClick={logout} 
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

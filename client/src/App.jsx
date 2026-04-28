import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import HomePage from './pages/HomePage'
import Telemedicine from "./pages/Telemedicine";
import VideoConsultation from './pages/VideoConsultation';
import UserManagement from './pages/Admin/UserManagement'
import PaymentManagement from './pages/Admin/PaymentManagement'
import MainDashboard from './components/MainDashboard'
import SymptomChecker from './components/SymptomChecker'
import Navbar from './components/Navbar'

// New Pages
import FindDoctor from './pages/Patient/FindDoctor'
import DoctorBooking from './pages/Patient/DoctorBooking'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorProfileSettings from './pages/Doctor/DoctorProfileSettings'
import PatientDashboard from './pages/Patient/PatientDashboard'

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!hideNavbar && <Navbar />}
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/admin-maindashboard' element={<MainDashboard />} />
          <Route path='/admin-usermanagement' element={<UserManagement />} />
          <Route path='/admin-payments' element={<PaymentManagement />} />
          <Route path="/telemedicine" element={<Telemedicine />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          
          {/* New Routes */}
          <Route path="/patient-home" element={<PatientDashboard />} />
          <Route path="/find-doctor" element={<FindDoctor />} />
          <Route path="/book-doctor/:id" element={<DoctorBooking />} />
          <Route path="/video-consultation" element={<VideoConsultation />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-settings" element={<DoctorProfileSettings />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

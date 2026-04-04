import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import './App.css'

function App() {

  return (
   <Router>
      <Routes>
        {/* Redirect the blank URL to the login page */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Define our specific routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App

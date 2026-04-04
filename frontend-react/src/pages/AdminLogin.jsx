import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAPI from '../services/adminApi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.post('/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border-t-8 border-indigo-600">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">System Admin</h2>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input 
            type="email" placeholder="Admin Email" required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500"
            value={email} onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500"
            value={password} onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md">
            Enter Command Center
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLogin;
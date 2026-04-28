import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Patient');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Admin direct login bypass
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
      localStorage.setItem('token', 'admin-dummy-token');
      localStorage.setItem('user', JSON.stringify({ role: 'Admin', email: formData.email }));
      navigate('/admin-maindashboard');
      return;
    }

    const port = role === 'Patient' ? '5001' : '5002';

    try {
      const response = await fetch(`http://localhost:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'Admin') navigate('/admin-usermanagement');
      else if (data.user.role === 'Doctor') navigate('/doctor-dashboard');
      else navigate('/patient-home');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const roles = ['Patient', 'Doctor', 'Admin'];

  const features = [
    'Secure patient record access',
    'Real-time appointment scheduling',
    'Direct messaging with your care team',
    'Prescription and lab result tracking',
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-5/12 bg-[#0f2d52] flex-col justify-between px-10 py-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-white/[0.04] pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v18M3 12h18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white text-lg font-semibold tracking-wide">MediPortal</span>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <span className="inline-block bg-blue-500/20 text-blue-300 text-[11px] font-medium tracking-[1.5px] uppercase px-3 py-1 rounded-full mb-6 w-fit">
            Healthcare Platform
          </span>
          <h1 className="text-white text-[2rem] font-semibold leading-snug mb-4">
            Your health,<br />our priority.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Access appointments, records, and communications — all in one secure place.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-xs relative z-10">
          &copy; 2026 MediPortal. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-10 w-full max-w-md">

          {/* Card Header */}
          <div className="mb-7">
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-blue-500 mb-1">
              Welcome back
            </p>
            <h2 className="text-2xl font-semibold text-[#0f2d52] mb-1">
              Sign in to portal
            </h2>
            <p className="text-sm text-gray-400">
              Choose your account type and enter your credentials.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-6">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  role === r
                    ? 'bg-white text-[#0f2d52] border border-black/10 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 bg-transparent border-none'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Alert Message */}
          {message.text && (
            <div
              className={`text-sm px-4 py-3 rounded-lg mb-5 border ${
                message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 flex items-center pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-black/[0.12] rounded-lg text-sm text-[#0f2d52] placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 flex items-center pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-black/[0.12] rounded-lg text-sm text-[#0f2d52] placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-blue-500 font-medium hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0f2d52] hover:bg-[#185fa5] active:scale-[0.99] text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-200 tracking-wide"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-xs text-gray-300">or</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 font-medium hover:underline">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
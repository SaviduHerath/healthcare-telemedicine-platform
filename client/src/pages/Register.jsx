import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [role, setRole] = useState('Patient');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phoneNumber: '', nic: '',
    bloodGroup: '', allergies: '', gender: 'Male', dateOfBirth: '',
    specialization: '', medicalLicenseNumber: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const port = role === 'Patient' ? '5001' : '5002';

    try {
      const response = await fetch(`http://localhost:${port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      setMessage({
        type: 'success',
        text: role === 'Doctor'
          ? '✅ Registration submitted! Pending Admin approval.'
          : '✅ Account created! You can now sign in.'
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Book appointments with top specialists',
    'Access your health records anytime',
    'Secure video consultations from home',
    'Prescription & lab result tracking',
  ];

  const inputClass =
    'w-full pl-9 pr-4 py-2.5 border border-black/[0.12] rounded-lg text-sm text-[#0f2d52] placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition';
  const selectClass =
    'w-full pl-9 pr-4 py-2.5 border border-black/[0.12] rounded-lg text-sm text-[#0f2d52] bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition appearance-none';

  /* ─── SVG Icons ─── */
  const IconUser = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
  const IconMail = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
  const IconLock = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const IconPhone = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
  const IconId = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M8 10h8M8 14h5" />
    </svg>
  );
  const IconCalendar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
  const IconHeart = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
  const IconBadge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.09 4.26L19 7.27l-3.5 3.41.83 4.82L12 13.27l-4.33 2.23.83-4.82L5 7.27l4.91-.71L12 2z" />
    </svg>
  );
  const IconGender = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" />
    </svg>
  );

  const fieldIcon = (Icon) => (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 flex items-center pointer-events-none">
      <Icon />
    </span>
  );

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
            Join Today
          </span>
          <h1 className="text-white text-[2rem] font-semibold leading-snug mb-4">
            Start your health<br />journey with us.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Create your free account and get access to world-class healthcare services, all in one place.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="text-white/60 text-sm">{b}</span>
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
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-10 w-full max-w-lg">

          {/* Card Header */}
          <div className="mb-7">
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-blue-500 mb-1">
              Get started
            </p>
            <h2 className="text-2xl font-semibold text-[#0f2d52] mb-1">
              Create your account
            </h2>
            <p className="text-sm text-gray-400">
              Choose your role and fill in your details below.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-6">
            {['Patient', 'Doctor'].map((r) => (
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
            <div className={`text-sm px-4 py-3 rounded-lg mb-5 border ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Full Name</label>
              <div className="relative">
                {fieldIcon(IconUser)}
                <input type="text" name="fullName" placeholder="John Doe" required onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Email address</label>
              <div className="relative">
                {fieldIcon(IconMail)}
                <input type="email" name="email" placeholder="you@example.com" required onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Password</label>
              <div className="relative">
                {fieldIcon(IconLock)}
                <input type="password" name="password" placeholder="Min. 6 characters" minLength="6" required onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Phone & NIC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Phone Number</label>
                <div className="relative">
                  {fieldIcon(IconPhone)}
                  <input type="text" name="phoneNumber" placeholder="+94 77 xxx xxxx" required onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">NIC Number</label>
                <div className="relative">
                  {fieldIcon(IconId)}
                  <input type="text" name="nic" placeholder="XXXXXXXXX V" required onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* ── PATIENT FIELDS ── */}
            {role === 'Patient' && (
              <div className="space-y-4 pt-2 border-t border-blue-50">
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-blue-400 pt-1">Patient Details</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Date of Birth</label>
                    <div className="relative">
                      {fieldIcon(IconCalendar)}
                      <input type="date" name="dateOfBirth" required onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Blood Group</label>
                    <div className="relative">
                      {fieldIcon(IconHeart)}
                      <input type="text" name="bloodGroup" placeholder="e.g. O+" required onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Gender</label>
                    <div className="relative">
                      {fieldIcon(IconGender)}
                      <select name="gender" onChange={handleChange} className={selectClass}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Allergies</label>
                    <div className="relative">
                      {fieldIcon(IconId)}
                      <input type="text" name="allergies" placeholder="Optional" onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DOCTOR FIELDS ── */}
            {role === 'Doctor' && (
              <div className="space-y-4 pt-2 border-t border-green-50">
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-green-500 pt-1">Professional Details</p>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Specialization</label>
                  <div className="relative">
                    {fieldIcon(IconBadge)}
                    <input type="text" name="specialization" placeholder="e.g. Cardiologist" required onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide">Medical License Number</label>
                  <div className="relative">
                    {fieldIcon(IconId)}
                    <input type="text" name="medicalLicenseNumber" placeholder="License #" required onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-4 py-3 rounded-lg">
                  ⏳ Doctor accounts require Admin approval before you can sign in.
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2d52] hover:bg-[#185fa5] active:scale-[0.99] text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-xs text-gray-300">or</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 font-medium hover:underline">
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
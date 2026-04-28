import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

/* ─── Tab button ─── */
const Tab = ({ label, count, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-all duration-150 ${
      active
        ? 'border-blue-500 text-[#0f2d52]'
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`}
  >
    {label}
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        active
          ? badge
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-blue-100 text-blue-600'
          : 'bg-gray-100 text-gray-400'
      }`}
    >
      {count}
    </span>
  </button>
);

/* ─── Empty state ─── */
const EmptyState = ({ icon, title, sub }) => (
  <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-14 flex flex-col items-center text-center">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mb-4">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-[#0f2d52] mb-1">{title}</h3>
    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{sub}</p>
  </div>
);

/* ─── Loading skeleton ─── */
const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-50 animate-pulse last:border-b-0">
        <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-2.5 bg-gray-50 rounded w-1/2" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full self-center" />
      </div>
    ))}
  </div>
);

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  /* ── Data fetchers ── */
  const fetchPendingDoctors = async () => {
    const res = await fetch('http://localhost:5002/api/admin/unapproved-doctors');
    if (!res.ok) throw new Error('Failed to fetch pending doctors');
    setPendingDoctors(await res.json());
  };
  const fetchAllDoctors = async () => {
    const res = await fetch('http://localhost:5002/api/admin/all-doctors');
    if (!res.ok) throw new Error('Failed to fetch all doctors');
    setAllDoctors(await res.json());
  };
  const fetchAllPatients = async () => {
    const res = await fetch('http://localhost:5001/api/admin/all-patients');
    if (!res.ok) throw new Error('Failed to fetch all patients');
    setAllPatients(await res.json());
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPendingDoctors(), fetchAllDoctors(), fetchAllPatients()]);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  /* ── Actions ── */
  const handleApprove = async (id, name) => {
    try {
      const res = await fetch(`http://localhost:5002/api/admin/approve-doctor/${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Approval failed');
      flash('success', `Dr. ${name} approved successfully.`);
      setPendingDoctors(prev => prev.filter(d => d._id !== id));
      fetchAllDoctors();
    } catch (err) {
      flash('error', err.message);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject and delete Dr. ${name}?`)) return;
    try {
      const res = await fetch(`http://localhost:5002/api/admin/reject-doctor/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Rejection failed');
      flash('success', `Dr. ${name} registration rejected.`);
      setPendingDoctors(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      flash('error', err.message);
    }
  };

  /* ── Avatar initials ── */
  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  /* ── Avatar color based on name ── */
  const avatarColor = (name = '') => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-orange-100 text-orange-600',
      'bg-rose-100 text-rose-600',
    ];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  /* ══════════════════════════════════════
     PENDING DOCTORS TABLE
  ══════════════════════════════════════ */
  const renderPending = () => {
    if (pendingDoctors.length === 0)
      return (
        <EmptyState
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          title="You're all caught up!"
          sub="No doctors are waiting for approval right now."
        />
      );

    return (
      <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
            {pendingDoctors.length} awaiting review
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Doctor</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Email</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Specialization</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">License No.</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingDoctors.map((doc) => (
              <tr key={doc._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(doc.fullName)}`}>
                      {initials(doc.fullName)}
                    </div>
                    <span className="text-sm font-medium text-[#0f2d52]">{doc.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{doc.email}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {doc.specialization}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">{doc.medicalLicenseNumber}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApprove(doc._id, doc.fullName)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#0f2d52] hover:bg-[#185fa5] text-white transition-all duration-150 active:scale-95"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(doc._id, doc.fullName)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-black/[0.12] text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-150 active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ══════════════════════════════════════
     ALL DOCTORS TABLE
  ══════════════════════════════════════ */
  const renderDoctors = () => {
    if (allDoctors.length === 0)
      return (
        <EmptyState
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          title="No doctors registered"
          sub="Once doctors sign up, they'll appear here for management."
        />
      );

    return (
      <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
            {allDoctors.length} total doctors
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Doctor</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Email</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Specialization</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {allDoctors.map((doc) => (
              <tr key={doc._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(doc.fullName)}`}>
                      {initials(doc.fullName)}
                    </div>
                    <span className="text-sm font-medium text-[#0f2d52]">{doc.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{doc.email}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{doc.specialization}</td>
                <td className="px-5 py-3.5">
                  {doc.isApproved ? (
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ══════════════════════════════════════
     ALL PATIENTS TABLE
  ══════════════════════════════════════ */
  const renderPatients = () => {
    if (allPatients.length === 0)
      return (
        <EmptyState
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          title="No patients registered"
          sub="Once patients sign up, their records will appear here."
        />
      );

    return (
      <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
            {allPatients.length} total patients
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Patient</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Email</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Date of Birth</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Gender</th>
              <th className="px-5 py-3 text-xs font-medium text-gray-400 tracking-wide">Blood Group</th>
            </tr>
          </thead>
          <tbody>
            {allPatients.map((pat) => (
              <tr key={pat._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(pat.fullName)}`}>
                      {initials(pat.fullName)}
                    </div>
                    <span className="text-sm font-medium text-[#0f2d52]">{pat.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{pat.email}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">
                  {pat.dateOfBirth ? new Date(pat.dateOfBirth).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500 capitalize">{pat.gender || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {pat.bloodGroup || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <AdminLayout
      pageTitle="User Management"
      pageSubtitle="Manage doctor approvals, doctors and patients"
    >
      {/* Flash Message */}
      {message.text && (
        <div
          className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
            message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {message.type === 'error' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          )}
          {message.text}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex items-center gap-6 border-b border-black/[0.08] mb-6">
        <Tab
          label="Pending Approvals"
          count={pendingDoctors.length}
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
          badge
        />
        <Tab
          label="All Doctors"
          count={allDoctors.length}
          active={activeTab === 'doctors'}
          onClick={() => setActiveTab('doctors')}
        />
        <Tab
          label="All Patients"
          count={allPatients.length}
          active={activeTab === 'patients'}
          onClick={() => setActiveTab('patients')}
        />

        {/* Refresh */}
        <button
          onClick={loadData}
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#0f2d52] transition"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          {activeTab === 'pending'  && renderPending()}
          {activeTab === 'doctors'  && renderDoctors()}
          {activeTab === 'patients' && renderPatients()}
        </>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
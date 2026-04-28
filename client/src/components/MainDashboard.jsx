import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

/* ─── tiny stat card ─── */
const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400 tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#0f2d52]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── module tile ─── */
const ModuleTile = ({ title, description, badgeText, badgeColor, path, icon, navigate }) => (
  <div
    onClick={() => navigate(path)}
    className="bg-white rounded-2xl border border-black/[0.07] shadow-sm p-6 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 bg-[#0f2d52]/[0.06] rounded-xl flex items-center justify-center text-[#0f2d52] group-hover:bg-blue-500 group-hover:text-white transition-all duration-200">
        {icon}
      </div>
      {badgeText && (
        <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded-full ${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>
    <h3 className="text-base font-semibold text-[#0f2d52] mb-1">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    <div className="mt-5 flex items-center gap-1 text-xs font-medium text-blue-500 group-hover:gap-2 transition-all duration-150">
      Open module
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  </div>
);

const MainDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, pending: 0, pendingPayments: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docRes, patRes, pendRes, payRes] = await Promise.all([
          fetch('http://localhost:5002/api/admin/all-doctors'),
          fetch('http://localhost:5001/api/admin/all-patients'),
          fetch('http://localhost:5002/api/admin/unapproved-doctors'),
          fetch('http://localhost:5009/api/payments/admin/pending', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        const [docs, pats, pend, payments] = await Promise.all([
          docRes.json(), patRes.json(), pendRes.json(), 
          payRes.ok ? payRes.json() : { payments: [] },
        ]);
        setStats({
          doctors: Array.isArray(docs) ? docs.filter(d => d.isApproved).length : 0,
          patients: Array.isArray(pats) ? pats.length : 0,
          pending: Array.isArray(pend) ? pend.length : 0,
          pendingPayments: Array.isArray(payments.payments) ? payments.payments.filter(p => p.status === 'Pending').length : 0,
        });
      } catch (_) { /* silently fail – show zeros */ }
    };
    fetchStats();
  }, []);

  const modules = [
    {
      title: 'User Management',
      description: 'Approve pending doctor registrations, view all doctors and patients on the platform.',
      path: '/admin-usermanagement',
      badgeText: stats.pending > 0 ? `${stats.pending} pending` : null,
      badgeColor: 'bg-yellow-100 text-yellow-700',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Payment Management',
      description: 'Review patient payments, approve/reject bank transfers, and manage payment records.',
      path: '/admin-payments',
      badgeText: stats.pendingPayments > 0 ? `${stats.pendingPayments} pending` : null,
      badgeColor: 'bg-red-100 text-red-700',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <path d="M1 10h22" />
          <circle cx="6" cy="15" r="1" />
        </svg>
      ),
    },
    {
      title: 'System Logs',
      description: 'Monitor platform activity, service health and error logs across all microservices.',
      path: '/system-logs',
      badgeText: 'Soon',
      badgeColor: 'bg-gray-100 text-gray-500',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      title: 'Settings',
      description: 'Configure system-wide parameters, notifications and security policies.',
      path: '/settings',
      badgeText: 'Soon',
      badgeColor: 'bg-gray-100 text-gray-500',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Main Dashboard"
      pageSubtitle="Overview of platform activity"
    >
      {/* Welcome Banner */}
      <div className="bg-[#0f2d52] rounded-2xl px-8 py-7 mb-8 flex items-center justify-between relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-8 right-32 w-28 h-28 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block bg-blue-500/20 text-blue-300 text-[10px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-full mb-3">
            Healthcare Platform
          </span>
          <h2 className="text-white text-xl font-semibold mb-1">Welcome back, System Admin</h2>
          <p className="text-white/50 text-sm">Here's what's happening on MediPortal today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs font-medium">All services operational</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Approved Doctors"
          value={stats.doctors}
          sub="Active on platform"
          accent="bg-blue-50 text-blue-500"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
        <StatCard
          label="Registered Patients"
          value={stats.patients}
          sub="Total registered"
          accent="bg-green-50 text-green-600"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pending}
          sub={stats.pending > 0 ? 'Requires attention' : 'All clear'}
          accent={stats.pending > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-400'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Pending Payments"
          value={stats.pendingPayments}
          sub={stats.pendingPayments > 0 ? 'Awaiting verification' : 'All verified'}
          accent={stats.pendingPayments > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <path d="M1 10h22" />
            </svg>
          }
        />
      </div>

      {/* Module Tiles */}
      <div className="mb-5">
        <p className="text-xs font-medium tracking-[1.5px] uppercase text-gray-400 mb-4">Admin Modules</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <ModuleTile key={mod.path} {...mod} navigate={navigate} />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MainDashboard;
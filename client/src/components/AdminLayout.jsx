import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin-maindashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'User Management',
    path: '/admin-usermanagement',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'System Logs',
    path: '/system-logs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const AdminLayout = ({ children, pageTitle, pageSubtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#0f2d52] flex flex-col shrink-0 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.07] relative z-10">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v18M3 12h18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white text-base font-semibold tracking-wide">MediPortal</span>
        </div>

        {/* Admin Badge */}
        <div className="px-6 pt-5 pb-3 relative z-10">
          <span className="inline-block bg-blue-500/20 text-blue-300 text-[10px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-full">
            Admin Panel
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 pb-4 flex flex-col gap-1 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-500/20 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-white/30'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6 border-t border-white/[0.07] pt-4 relative z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="bg-white border-b border-black/[0.08] px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-blue-500 mb-0.5">
              MediPortal Admin
            </p>
            <h1 className="text-lg font-semibold text-[#0f2d52]">{pageTitle}</h1>
            {pageSubtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{pageSubtitle}</p>
            )}
          </div>

          {/* Admin Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#0f2d52]">System Admin</p>
              <p className="text-xs text-gray-400">admin@gmail.com</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0f2d52] flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

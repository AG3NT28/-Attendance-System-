import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  Users, 
  Settings, 
  LogOut, 
  Tv2, 
  Menu, 
  X, 
  GraduationCap 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Live Attendance', path: '/admin/attendance', icon: Radio },
    { label: 'Student Roster', path: '/admin/students', icon: Users },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-brand-500" />
          <span className="font-bold text-white text-sm">Attendance Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 shrink-0 border-r border-slate-800/80 bg-slate-900/90 p-5 md:min-h-screen flex flex-col justify-between`}
      >
        <div>
          {/* Brand Logo */}
          <div className="hidden md:flex items-center gap-3 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-black text-sm text-white tracking-wide">ATTENDANCE</div>
              <div className="text-[11px] font-medium text-brand-400">Admin Control Center</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
          {/* Projector Display Screen Link */}
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl bg-brand-950/60 border border-brand-500/30 px-3.5 py-2.5 text-xs font-bold text-brand-300 hover:bg-brand-900/50 transition"
          >
            <Tv2 className="h-4 w-4" />
            Open Projector Screen
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut className="h-4 w-4" />
            Log Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

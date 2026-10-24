import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Radio, 
  Users, 
  Settings, 
  LogOut, 
  Tv2, 
  Menu, 
  X, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import RetroHeader from './RetroHeader';

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  const navItems = [
    { label: 'CONTROL DASHBOARD', path: '/admin/dashboard', code: '01', icon: Terminal },
    { label: 'LIVE AUDIT FEED', path: '/admin/attendance', code: '02', icon: Radio },
    { label: 'STUDENT ROSTER', path: '/admin/students', code: '03', icon: Users },
    { label: 'SYSTEM SETTINGS', path: '/admin/settings', code: '04', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans">
      {/* Top Global Retro Header */}
      <RetroHeader />

      <div className="flex flex-col md:flex-row flex-1">
        {/* Mobile Top Bar */}
        <div className="flex md:hidden items-center justify-between border-b-2 border-black bg-retro-panel px-4 py-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-righteous text-retro-yellow text-sm uppercase">ADMIN CONSOLE</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-2 border-black bg-retro-card p-1 text-white shadow-[2px_2px_0px_#000]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Desktop & Collapsible Mobile Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 shrink-0 border-r-2 border-black bg-retro-dark p-5 flex flex-col justify-between font-mono`}
        >
          <div>
            {/* Logo */}
            <div className="hidden md:block px-2 py-4 border-b-2 border-black mb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-retro-yellow border border-black shadow-[1px_1px_0px_#000]"></div>
                <div className="font-righteous text-base text-white tracking-wider uppercase">
                  OPERATOR DECK
                </div>
              </div>
              <div className="text-[10px] text-retro-yellow uppercase mt-1 tracking-wider font-bold">
                ATTENDANCE // 2.0
              </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-2 text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 transition border-2 border-black font-bold uppercase ${
                        isActive
                          ? 'bg-retro-pink text-white shadow-brutal'
                          : 'bg-retro-card text-zinc-300 hover:text-white hover:bg-retro-panel'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[10px] opacity-70">[{item.code}]</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Utility Controls */}
          <div className="mt-8 pt-5 border-t-2 border-black space-y-2.5 text-xs">
            <a
              href="/display"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between btn-funky bg-retro-yellow text-black px-3 py-2 text-xs font-righteous uppercase"
            >
              <div className="flex items-center gap-2">
                <Tv2 className="h-3.5 w-3.5" />
                <span>PROJECTOR HUD</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 border-2 border-black bg-zinc-900 px-3 py-2 text-[11px] text-red-300 hover:bg-retro-pink hover:text-white transition shadow-[2px_2px_0px_#000]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>DISCONNECT OPERATOR</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-checker-dark bg-checker-sm">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

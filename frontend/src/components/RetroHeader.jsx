import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Star, LogOut, ShieldCheck, Zap, Tv2, Terminal, Smartphone } from 'lucide-react';

export default function RetroHeader() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsAdmin(Boolean(token));
  }, [location]);

  // Secret developer/authorized shortcut: Ctrl+Shift+A or Alt+A opens /admin
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || 
          (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Secret developer/authorized shortcut: triple-click logo opens /admin
  const handleSecretLogoClick = (e) => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setClickCount(0);
      navigate('/admin');
    }
    setTimeout(() => setClickCount(0), 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAdmin(false);
    navigate('/scan');
  };

  const isScanActive = location.pathname === '/scan' || location.pathname === '/';
  const isPassActive = location.pathname.startsWith('/register');
  const isDisplayActive = location.pathname === '/display';
  const isAdminActive = location.pathname.startsWith('/admin');
  const isPreviewActive = location.pathname === '/preview' || location.pathname === '/mobile';

  return (
    <header className="w-full border-b-2 border-black bg-[#130b24] select-none font-mono">
      {/* Tier 1: MVJCE College & Event Identity Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b-2 border-black bg-[#1a0f30]">
        
        {/* Brand Logo (Secret triple-click trigger for admin login) */}
        <div 
          onClick={handleSecretLogoClick}
          className="flex items-center gap-2.5 cursor-pointer group transition"
          title="MVJCE - MVJ College of Engineering"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-retro-yellow text-black border-2 border-black shadow-[2px_2px_0px_#000] group-hover:scale-105 transition">
            <Star className="h-4 w-4 fill-black stroke-black" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-1.5 font-righteous text-sm sm:text-base text-white tracking-wider">
              <span className="text-retro-yellow font-black">MVJCE</span>
              <span className="text-white">TALENT'S DAY</span>
            </div>
            <span className="text-[10px] text-purple-300 font-mono font-bold tracking-tight">
              // ATTENDANCE PORTAL
            </span>
          </div>
        </div>

        {/* Right Section: Only visible to logged-in Admin. Students see College Fest tag */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden xs:flex items-center gap-1 px-2.5 py-1 text-[10px] font-righteous text-retro-yellow border-2 border-black bg-black shadow-[2px_2px_0px_#000]">
                <ShieldCheck className="h-3.5 w-3.5 text-retro-yellow" />
                ADMIN ACTIVE
              </span>
              <button
                onClick={handleLogout}
                className="btn-funky bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 text-[10px] font-righteous flex items-center gap-1"
                title="Log out and return to Student View"
              >
                <LogOut className="h-3 w-3" />
                <span>STUDENT VIEW</span>
              </button>
            </div>
          ) : (
            /* Student View: Festive MVJCE Badge (NO admin buttons visible to students) */
            <div className="flex items-center gap-1.5 text-right font-mono text-[10px] sm:text-[11px] text-purple-300 border border-purple-900/60 bg-black/40 px-2.5 py-1 rounded">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-retro-yellow animate-pulse"></span>
              <span className="font-bold text-white">BANGALORE</span>
              <span className="text-purple-400 hidden sm:inline">• EST. 1970</span>
            </div>
          )}
        </div>
      </div>

      {/* Tier 2: Dedicated Segmented Mode Switcher */}
      {!isAdmin ? (
        /* STUDENT VIEW: 50% / 50% Full-Width Segmented Switcher */
        <div className="grid grid-cols-2 divide-x-2 divide-black bg-[#150d28]">
          {/* Option 1: Mark Attendance */}
          <NavLink
            to="/scan"
            className={`py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 text-center font-righteous text-xs sm:text-sm uppercase tracking-wider transition ${
              isScanActive
                ? 'bg-retro-pink text-white shadow-[inset_0_-3px_0px_#000]'
                : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Zap className={`h-4 w-4 shrink-0 ${isScanActive ? 'fill-retro-yellow text-black' : 'text-zinc-500'}`} />
            <span className="truncate">01 MARK ATTENDANCE</span>
          </NavLink>

          {/* Option 2: Get Talent Pass */}
          <NavLink
            to="/register?key=STATIC_REG_QR_KEY_SECRET_7890"
            className={`py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 text-center font-righteous text-xs sm:text-sm uppercase tracking-wider transition ${
              isPassActive
                ? 'bg-retro-yellow text-black shadow-[inset_0_-3px_0px_#000]'
                : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Star className={`h-4 w-4 shrink-0 ${isPassActive ? 'fill-black text-black' : 'text-zinc-500'}`} />
            <span className="truncate">02 GET TALENT PASS</span>
          </NavLink>
        </div>
      ) : (
        /* ADMIN VIEW: Full Capability Strip */
        <div className="flex items-stretch overflow-x-auto scrollbar-none divide-x-2 divide-black bg-[#150d28]">
          <NavLink
            to="/scan"
            className={`px-3.5 py-2.5 text-xs font-mono font-bold uppercase whitespace-nowrap transition flex items-center gap-1.5 ${
              isScanActive ? 'bg-retro-pink text-white shadow-[inset_0_-2px_0px_#000]' : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            01 SCAN TERMINAL
          </NavLink>
          <NavLink
            to="/display"
            className={`px-3.5 py-2.5 text-xs font-mono font-bold uppercase whitespace-nowrap transition flex items-center gap-1.5 ${
              isDisplayActive ? 'bg-retro-pink text-white shadow-[inset_0_-2px_0px_#000]' : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Tv2 className="h-3.5 w-3.5" />
            02 AUDITORIUM PROJECTOR HUD
          </NavLink>
          <NavLink
            to="/register?key=STATIC_REG_QR_KEY_SECRET_7890"
            className={`px-3.5 py-2.5 text-xs font-mono font-bold uppercase whitespace-nowrap transition flex items-center gap-1.5 ${
              isPassActive ? 'bg-retro-pink text-white shadow-[inset_0_-2px_0px_#000]' : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            03 TALENT PASS
          </NavLink>
          <NavLink
            to="/admin/dashboard"
            className={`px-3.5 py-2.5 text-xs font-mono font-bold uppercase whitespace-nowrap transition flex items-center gap-1.5 ${
              isAdminActive ? 'bg-retro-yellow text-black shadow-[inset_0_-2px_0px_#000]' : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            04 ADMIN CONSOLE
          </NavLink>
          <NavLink
            to="/preview"
            className={`px-3.5 py-2.5 text-xs font-mono font-bold uppercase whitespace-nowrap transition flex items-center gap-1.5 ${
              isPreviewActive ? 'bg-retro-green text-black shadow-[inset_0_-2px_0px_#000]' : 'text-zinc-400 hover:text-white hover:bg-[#1f1438]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            📱 MOBILE LAB
          </NavLink>
        </div>
      )}
    </header>
  );
}

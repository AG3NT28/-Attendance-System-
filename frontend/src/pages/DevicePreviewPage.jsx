import React, { useState } from 'react';
import { 
  Smartphone, 
  RotateCw, 
  ExternalLink, 
  RefreshCw, 
  QrCode, 
  Wifi, 
  Battery, 
  Compass, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import RetroHeader from '../components/RetroHeader';

export default function DevicePreviewPage() {
  const [activeRoute, setActiveRoute] = useState('/scan');
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'ios' | 'android'
  const [scale, setScale] = useState(0.85); // 0.75, 0.85, 1.0
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' | 'landscape'
  const [iosKey, setIosKey] = useState(0);
  const [androidKey, setAndroidKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const host = window.location.hostname || '192.168.0.5';
  const localLanUrl = `${window.location.protocol}//${host}:5173${activeRoute}`;

  const routes = [
    { label: '01 SCAN TERMINAL', path: '/scan', desc: 'Student Attendance & 6-digit PIN' },
    { label: '02 PROJECTOR SCREEN', path: '/display', desc: 'Dynamic QR + Rolling 19s PIN' },
    { label: '03 TALENT PASS REGISTER', path: '/register?key=STATIC_REG_QR_KEY_SECRET_7890', desc: 'MVJCE Card Generator' },
    { label: '04 ADMIN CONSOLE', path: '/admin', desc: 'Facilitator Login & Dashboard' },
  ];

  const handleCopyLan = () => {
    navigator.clipboard.writeText(localLanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07040e] text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Retro Header */}
      <RetroHeader />

      {/* Simulator Control Dashboard */}
      <section className="border-b-2 border-black bg-[#120a22] p-4 sm:p-5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-retro-yellow text-black shadow-brutal">
              <Smartphone className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-righteous text-xl sm:text-2xl text-white tracking-wide uppercase text-jojo-gold">
                  Mobile Device Lab
                </h1>
                <span className="border border-black bg-retro-pink text-white px-2 py-0.5 text-[10px] font-righteous uppercase">
                  iOS + ANDROID
                </span>
              </div>
              <p className="text-xs font-mono text-purple-300">
                Interactive real-time responsive simulation across mobile platforms
              </p>
            </div>
          </div>

          {/* Quick Route Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {routes.map((r) => (
              <button
                key={r.path}
                onClick={() => {
                  setActiveRoute(r.path);
                  setIosKey(k => k + 1);
                  setAndroidKey(k => k + 1);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-black transition shadow-[2px_2px_0px_#000] whitespace-nowrap ${
                  activeRoute === r.path
                    ? 'bg-retro-yellow text-black translate-x-[1px] translate-y-[1px]'
                    : 'bg-[#1b1033] text-zinc-300 hover:text-white hover:bg-[#251745]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Controls: Mode, Scale, Real Phone */}
          <div className="flex items-center gap-2">
            
            {/* View Mode Switcher */}
            <div className="flex border-2 border-black bg-black p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 ${viewMode === 'both' ? 'bg-retro-panel text-retro-yellow font-bold' : 'text-zinc-400'}`}
              >
                BOTH
              </button>
              <button
                onClick={() => setViewMode('ios')}
                className={`px-2.5 py-1 ${viewMode === 'ios' ? 'bg-retro-panel text-retro-yellow font-bold' : 'text-zinc-400'}`}
              >
                iOS
              </button>
              <button
                onClick={() => setViewMode('android')}
                className={`px-2.5 py-1 ${viewMode === 'android' ? 'bg-retro-panel text-retro-yellow font-bold' : 'text-zinc-400'}`}
              >
                ANDROID
              </button>
            </div>

            {/* Scale Switcher */}
            <div className="hidden md:flex border-2 border-black bg-black p-0.5 text-xs font-mono">
              {[0.75, 0.85, 1.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-2 py-1 ${scale === s ? 'bg-purple-800 text-white font-bold' : 'text-zinc-400'}`}
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>

            {/* Copy Real Phone Network Link */}
            <button
              onClick={handleCopyLan}
              className="btn-funky bg-retro-green text-black px-3 py-1.5 text-xs font-righteous flex items-center gap-1.5"
              title="Copy link to open on your actual mobile phone"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'COPIED!' : 'PHONE LAN LINK'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Real Phone Wi-Fi Helper Bar */}
      <div className="border-b-2 border-black bg-[#160c2b] py-2 px-4 text-center font-mono text-xs flex flex-wrap items-center justify-center gap-3 text-purple-200">
        <span className="flex items-center gap-1 text-retro-yellow font-bold">
          <Wifi className="h-3.5 w-3.5" />
          TEST ON YOUR PHYSICAL SMARTPHONE:
        </span>
        <code className="bg-black text-retro-yellow px-2 py-0.5 border border-purple-900 rounded font-bold">
          {localLanUrl}
        </code>
        <span className="text-[11px] text-zinc-400">
          (Make sure your phone is connected to the same Wi-Fi network)
        </span>
      </div>

      {/* Device Viewport Canvas */}
      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-auto">
        <div 
          className="flex flex-wrap items-start justify-center gap-8 sm:gap-14 transition-all duration-300"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >

          {/* ========================================================= */}
          {/* 1. APPLE iOS SIMULATOR (iPhone 16 Pro, Safari Mobile) */}
          {/* ========================================================= */}
          {(viewMode === 'both' || viewMode === 'ios') && (
            <div className="flex flex-col items-center">
              
              {/* Device Header Badge */}
              <div className="mb-3 flex items-center gap-2 border-2 border-black bg-black px-4 py-1.5 text-xs font-mono shadow-[2px_2px_0px_#000]">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-bold text-white uppercase tracking-wider">Apple iOS // iPhone 16 Pro</span>
                <span className="text-zinc-500">|</span>
                <span className="text-retro-yellow font-bold">393 × 852 px</span>
              </div>

              {/* iPhone Hardware Chassis */}
              <div className="relative w-[393px] h-[852px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#2d2d34] via-[#1b1b22] to-[#121217] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_#3f3f46,inset_0_0_0_3px_#09090b] flex flex-col overflow-hidden border-4 border-[#33333e]">
                
                {/* Physical Action / Volume Buttons simulation */}
                <div className="absolute -left-[7px] top-[115px] w-[3px] h-[28px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -left-[7px] top-[160px] w-[3px] h-[50px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -left-[7px] top-[220px] w-[3px] h-[50px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -right-[7px] top-[170px] w-[3px] h-[75px] bg-zinc-600 rounded-r"></div>

                {/* Inner Screen Display */}
                <div className="relative w-full h-full bg-[#0b0714] rounded-[44px] overflow-hidden flex flex-col border border-black/40">
                  
                  {/* Dynamic Island & iOS Status Bar */}
                  <div className="h-12 bg-black text-white px-7 flex items-center justify-between text-xs font-semibold relative z-30 shrink-0">
                    {/* Time */}
                    <span className="text-[13px] tracking-tight font-medium">9:41</span>
                    
                    {/* Dynamic Island */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-[28px] w-[112px] bg-black rounded-full border border-zinc-800/80 flex items-center justify-between px-3 shadow-inner">
                      <div className="h-3 w-3 rounded-full bg-zinc-900 border border-zinc-800"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-[#081829] flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-[#1e40af]"></div>
                      </div>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <span className="text-[10px] font-mono font-bold tracking-tighter">5G</span>
                      <Wifi className="h-3.5 w-3.5" />
                      <div className="flex items-center border border-white/80 rounded-sm px-0.5 py-0.2 h-3 w-5">
                        <div className="h-full w-4 bg-white rounded-2xs"></div>
                      </div>
                    </div>
                  </div>

                  {/* Live Web Content Frame */}
                  <div className="flex-1 w-full overflow-hidden relative">
                    <iframe
                      key={`ios-${iosKey}-${activeRoute}`}
                      src={activeRoute}
                      title="iOS Viewport"
                      className="w-full h-full border-0 select-auto"
                      style={{ overflowY: 'auto' }}
                    />
                  </div>

                  {/* iOS Safari Bottom Navigation Bar */}
                  <div className="shrink-0 bg-[#160d26]/95 backdrop-blur-md border-t border-purple-900/40 p-2 flex flex-col gap-1.5 relative z-30">
                    {/* Safari Floating Address Bar */}
                    <div className="mx-auto w-[92%] h-8 bg-[#23153c] rounded-xl flex items-center justify-between px-3 text-[11px] font-mono text-zinc-300 border border-purple-700/50 shadow-inner">
                      <span className="text-zinc-500 text-[10px]">AA</span>
                      <span className="flex items-center gap-1 text-white font-medium truncate max-w-[200px]">
                        <span className="text-zinc-500">attendance.app</span>
                        <span className="text-retro-yellow">{activeRoute}</span>
                      </span>
                      <button 
                        onClick={() => setIosKey(k => k + 1)} 
                        className="text-zinc-400 hover:text-white"
                        title="Reload"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Safari Action Bar */}
                    <div className="flex items-center justify-around text-zinc-400 py-0.5 px-2">
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 text-zinc-700" />
                      <Share2 className="h-4 w-4" />
                      <Compass className="h-4 w-4" />
                      <Layers className="h-4 w-4" />
                    </div>

                    {/* iOS Home Indicator Bar */}
                    <div className="mx-auto w-32 h-1 bg-white/70 rounded-full mt-0.5 mb-1"></div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ANDROID SIMULATOR (Samsung Galaxy S24, Chrome Mobile) */}
          {/* ========================================================= */}
          {(viewMode === 'both' || viewMode === 'android') && (
            <div className="flex flex-col items-center">
              
              {/* Device Header Badge */}
              <div className="mb-3 flex items-center gap-2 border-2 border-black bg-black px-4 py-1.5 text-xs font-mono shadow-[2px_2px_0px_#000]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white uppercase tracking-wider">Android // Galaxy S24 / Pixel</span>
                <span className="text-zinc-500">|</span>
                <span className="text-retro-yellow font-bold">412 × 915 px</span>
              </div>

              {/* Android Hardware Chassis */}
              <div className="relative w-[412px] h-[852px] rounded-[40px] p-[10px] bg-gradient-to-b from-[#1a1a20] via-[#0d0d12] to-[#121218] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_#3f3f46,inset_0_0_0_3px_#000000] flex flex-col overflow-hidden border-4 border-[#2b2b36]">
                
                {/* Physical Power & Volume Rockers */}
                <div className="absolute -right-[7px] top-[140px] w-[3px] h-[45px] bg-zinc-600 rounded-r"></div>
                <div className="absolute -right-[7px] top-[210px] w-[3px] h-[75px] bg-zinc-600 rounded-r"></div>

                {/* Inner Screen Display */}
                <div className="relative w-full h-full bg-[#0b0714] rounded-[32px] overflow-hidden flex flex-col border border-black/40">
                  
                  {/* Android Material Status Bar */}
                  <div className="h-7 bg-[#10091d] text-zinc-300 px-5 flex items-center justify-between text-xs font-mono relative z-30 shrink-0">
                    <span className="text-[12px] font-bold text-white">09:41</span>
                    
                    {/* Centered Punch-Hole Camera */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-3.5 w-3.5 bg-black rounded-full border border-zinc-700/70 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0d233a]"></div>
                    </div>

                    {/* Android Icons */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-emerald-400">LTE+</span>
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3.5 w-3.5 fill-white" />
                    </div>
                  </div>

                  {/* Android Chrome Top Address Bar */}
                  <div className="h-11 bg-[#1a0f2e] border-b border-purple-900/50 px-3 flex items-center justify-between gap-2 relative z-30 shrink-0">
                    <div className="flex-1 h-8 bg-black/60 rounded-full flex items-center justify-between px-3 text-[11px] font-mono border border-purple-800/40">
                      <span className="text-zinc-400 truncate max-w-[220px]">
                        localhost:5173<span className="text-retro-yellow">{activeRoute}</span>
                      </span>
                      <button
                        onClick={() => setAndroidKey(k => k + 1)}
                        className="text-zinc-400 hover:text-white"
                        title="Reload"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Chrome Tab Pill & Menu */}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <div className="h-5 w-5 border border-zinc-500 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-white">
                        1
                      </div>
                      <div className="text-base font-bold text-zinc-400 px-0.5">⋮</div>
                    </div>
                  </div>

                  {/* Live Web Content Frame */}
                  <div className="flex-1 w-full overflow-hidden relative">
                    <iframe
                      key={`android-${androidKey}-${activeRoute}`}
                      src={activeRoute}
                      title="Android Viewport"
                      className="w-full h-full border-0 select-auto"
                      style={{ overflowY: 'auto' }}
                    />
                  </div>

                  {/* Android Modern Gesture Navigation Bar */}
                  <div className="h-6 bg-[#10091d] shrink-0 flex items-center justify-center relative z-30">
                    <div className="w-24 h-1 bg-white/70 rounded-full"></div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Footer Notes & Hotkeys */}
      <footer className="border-t-2 border-black bg-[#100720] py-4 px-6 font-mono text-xs text-zinc-400 text-center flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-purple-300">
          <Sparkles className="h-4 w-4 text-retro-yellow" />
          <span>Both mobile frames run live interactive instances with touch emulation and real API proxying.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>PRO-TIP: Press <kbd className="bg-black px-1.5 py-0.5 border border-purple-800 text-white font-bold rounded">F12</kbd> &rarr; <kbd className="bg-black px-1.5 py-0.5 border border-purple-800 text-white font-bold rounded">Ctrl+Shift+M</kbd> for browser native device toolbar.</span>
        </div>
      </footer>
    </div>
  );
}


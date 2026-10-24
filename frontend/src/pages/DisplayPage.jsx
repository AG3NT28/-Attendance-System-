import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  RefreshCw, 
  Radio, 
  Tv2, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Star,
  Flame
} from 'lucide-react';
import RetroHeader from '../components/RetroHeader';

export default function DisplayPage() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [liveAttendanceCount, setLiveAttendanceCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Active Sessions periodically
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const res = await axios.get('/api/sessions/active');
        const list = res.data.sessions || [];
        setActiveSessions(list);
        if (list.length > 0 && !selectedSessionId) {
          setSelectedSessionId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load active sessions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 4000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  // 2. Poll QR token and PIN for selected session
  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchToken = async () => {
      try {
        const [qrRes, liveRes] = await Promise.all([
          axios.get(`/api/token/qr/${selectedSessionId}`),
          axios.get(`/api/attendance/live/${selectedSessionId}`)
        ]);

        const data = qrRes.data;
        setTokenData(data);
        setLiveAttendanceCount(liveRes.data?.count || 0);

        if (data.expires_at) {
          const remainingSecs = Math.max(0, Math.ceil((data.expires_at - Date.now()) / 1000));
          setSecondsRemaining(remainingSecs);
        }
      } catch (err) {
        console.error('Failed to fetch QR token', err);
      }
    };

    fetchToken();
    const interval = setInterval(fetchToken, 2000);

    const tickInterval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, [selectedSessionId]);

  const currentSession = activeSessions.find((s) => s.id === selectedSessionId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-zinc-100 font-mono">
        <div className="border-2 border-black bg-[#150d24] p-6 flex items-center gap-3 shadow-brutal-amber">
          <RefreshCw className="h-5 w-5 animate-spin text-retro-yellow" />
          <span className="font-righteous text-sm uppercase tracking-wider text-white">
            INITIALIZING MVJCE AUDITORIUM DISPLAY...
          </span>
        </div>
      </div>
    );
  }

  // No active session view
  if (activeSessions.length === 0) {
    return (
      <div className="min-h-screen bg-transparent p-4 sm:p-8 flex flex-col justify-between font-sans">
        <div className="max-w-md mx-auto my-auto w-full border-2 border-black bg-[#150d24] p-8 text-center shadow-brutal-amber ring-light">
          <Tv2 className="h-10 w-10 text-retro-yellow mx-auto mb-4" />
          <h1 className="text-2xl font-righteous uppercase text-white tracking-wide text-jojo-gold">
            No Active Session
          </h1>
          <p className="mt-2 text-xs text-purple-300 font-mono leading-relaxed">
            Please start an attendance period in the Admin Console to project the QR code.
          </p>
          <a
            href="/admin"
            className="mt-6 inline-flex items-center justify-center gap-2 btn-funky bg-retro-yellow text-black px-6 py-3 font-righteous text-xs uppercase"
          >
            <span>OPEN ADMIN DASHBOARD</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </a>
        </div>
      </div>
    );
  }

  const pinString = tokenData?.unique_pin ? String(tokenData.unique_pin) : '------';
  const pinDigits = pinString.split('');
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 20) * 100));

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 px-3.5 sm:px-6 py-5 sm:py-10 flex flex-col items-center justify-center font-sans select-none relative overflow-x-hidden">
      
      {/* Outer Retro Framed Window with Golden Aura */}
      <div className="max-w-6xl mx-auto w-full rounded-2xl border-2 border-black bg-[#120c1f]/95 backdrop-blur-md shadow-brutal-amber beam-ring ring-light overflow-hidden flex flex-col my-auto relative z-10">
        
        {/* Top Tabbed Navigation Bar */}
        <RetroHeader />

        {/* Auditorium Session Info Header */}
        <div className="border-b-2 border-black bg-[#180e2e] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="border-2 border-black bg-retro-yellow text-black px-2.5 py-0.5 text-[10px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                ★ MVJCE AUDITORIUM LIVE
              </span>
              <span className="border-2 border-black bg-retro-panel px-2.5 py-0.5 text-[10px] font-bold text-white shadow-[2px_2px_0px_#000]">
                HOUR 0{currentSession?.hour_number || 1} / 05
              </span>
              {currentSession?.subject_code && (
                <span className="text-purple-300 font-mono text-xs">
                  [{currentSession.subject_code}]
                </span>
              )}
              <span className="font-righteous text-retro-pink text-xs ml-1">
                ★ TALENT'S DAY 2026 ★
              </span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-righteous text-white tracking-wide uppercase text-jojo-gold">
              {currentSession?.subject_name}
            </h1>
          </div>

          {/* Headcount Stat Box with Attendees Counter */}
          <div className="border-2 border-black bg-[#1f1438] px-5 py-3 shadow-brutal-amber flex items-center gap-3 stand-glow">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-black bg-retro-yellow text-black shadow-[2px_2px_0px_#000]">
              <Star className="h-6 w-6 fill-retro-yellow stroke-black stroke-[2]" />
            </div>
            <div>
              <div className="text-3xl font-righteous text-white tabular-num leading-none">
                {liveAttendanceCount}
              </div>
              <div className="text-[10px] font-mono text-retro-yellow uppercase tracking-widest mt-1 font-bold">
                ATTENDEES VERIFIED
              </div>
            </div>
          </div>
        </div>

        {/* Main Projection Field: QR Code & Large 6-Digit PIN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black">
          
          {/* Left Column (5 cols): Dynamic QR Code with Glowing Golden Frame */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-[#160e29]">
            <div className="border-2 border-black bg-white p-5 shadow-brutal-amber relative">
              <div className="absolute -top-3 -left-3 border-2 border-black bg-retro-pink text-white px-2 py-0.5 text-[10px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                SCAN TO ATTEND!
              </div>

              {tokenData?.qr_code ? (
                <img
                  src={tokenData.qr_code}
                  alt="Dynamic Classroom QR"
                  className="h-64 w-64 sm:h-72 sm:w-72 object-contain"
                />
              ) : (
                <div className="flex h-64 w-64 sm:h-72 sm:w-72 items-center justify-center bg-zinc-100 text-zinc-600">
                  <RefreshCw className="h-8 w-8 animate-spin text-black" />
                </div>
              )}
            </div>

            {/* Stepped Progress Bar with countdown */}
            <div className="mt-6 w-full max-w-xs font-mono">
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5 font-bold">
                <span className="flex items-center gap-1.5 text-retro-yellow text-[11px] uppercase">
                  <Zap className="h-3.5 w-3.5 fill-retro-yellow" />
                  PASSKEY ROTATION IN:
                </span>
                <span className="font-righteous text-white text-sm tabular-num">{secondsRemaining}s</span>
              </div>
              <div className="h-3.5 w-full border-2 border-black bg-black overflow-hidden shadow-[2px_2px_0px_#000]">
                <div
                  className="h-full bg-gradient-to-r from-retro-yellow via-retro-pink to-purple-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Billboard 6-Digit Split PIN with Golden Numerals */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-checker-dark bg-checker-sm bg-[#1c1236]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="border-2 border-black bg-retro-purple text-white px-3 py-1 text-xs font-righteous uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-retro-yellow stroke-black" />
                  AUDITORIUM STAGE PASSKEY
                </span>
                <span className="text-xs font-mono text-purple-300 font-bold">
                  ROTATES EVERY 19S
                </span>
              </div>

              {/* 6 Chunky Segmented PIN Digits with Golden Glow */}
              <div className="grid grid-cols-6 gap-1.5 sm:gap-3 my-4">
                {pinDigits.map((digit, idx) => (
                  <div
                    key={idx}
                    className="flex h-14 sm:h-20 lg:h-26 items-center justify-center border-2 border-black bg-black text-2xl sm:text-4xl lg:text-6xl font-righteous font-bold text-retro-yellow shadow-brutal-amber relative stand-glow"
                  >
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-900 pointer-events-none"></div>
                    {digit}
                  </div>
                ))}
              </div>

              <div className="border-2 border-black bg-[#150d24] p-4 mt-6 shadow-[3px_3px_0px_#000] font-mono text-xs">
                <div className="font-righteous text-retro-pink uppercase text-sm mb-1 flex items-center gap-1.5">
                  <Flame className="h-4 w-4" />
                  ATTENDANCE PROTOCOL:
                </div>
                <div className="text-purple-200 space-y-1 text-xs leading-relaxed">
                  <p>1. Open camera & scan the dynamic QR code on the left.</p>
                  <p>2. Enter your <strong className="text-white">Student ID</strong> + current 6-digit rolling PIN.</p>
                  <p>3. Tap Submit to seal your verified attendance in the ledger!</p>
                </div>
              </div>
            </div>

            {/* Micro Badge */}
            <div className="mt-6 flex items-center justify-between text-[11px] font-mono text-purple-400 pt-3 border-t-2 border-black">
              <span>OFFICIAL MVJCE TALENT'S DAY // IMMUTABLE AUDITORIUM LEDGER</span>
              <span className="text-retro-yellow font-righteous">MVJCE 2026</span>
            </div>
          </div>

        </div>

        {/* Bottom Decorative Trim Ribbon */}
        <div className="border-t-2 border-black bg-[#150d24] py-2 px-4 flex items-center justify-between text-xs font-mono overflow-hidden select-none">
          <div className="flex items-center gap-3 text-retro-yellow">
            {[...Array(6)].map((_, idx) => (
              <span key={idx} className="font-righteous text-sm leading-none text-retro-yellow">
                ✦ ★ ✧
              </span>
            ))}
          </div>

          <div className="text-[10px] font-mono text-purple-300 uppercase tracking-widest hidden sm:block font-bold">
            MVJ COLLEGE OF ENGINEERING // TALENT'S DAY 2026 AUDITORIUM DISPLAY
          </div>

          <div className="flex items-center gap-3 text-retro-pink">
            {[...Array(6)].map((_, idx) => (
              <span key={idx} className="font-righteous text-sm leading-none text-retro-pink">
                ✧ ★ ✦
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

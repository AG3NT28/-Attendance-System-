import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Tv2, 
  RefreshCw 
} from 'lucide-react';

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
    const interval = setInterval(fetchActiveSessions, 5000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  // 2. Poll QR token and PIN for the selected session
  useEffect(() => {
    if (!selectedSessionId) return;

    let previousToken = null;

    const fetchToken = async () => {
      try {
        const [qrRes, liveRes] = await Promise.all([
          axios.get(`/api/token/qr/${selectedSessionId}`),
          axios.get(`/api/attendance/live/${selectedSessionId}`)
        ]);

        const data = qrRes.data;
        setTokenData(data);
        setLiveAttendanceCount(liveRes.data?.count || 0);

        // Calculate seconds remaining
        if (data.expires_at) {
          const remainingSecs = Math.max(0, Math.ceil((data.expires_at - Date.now()) / 1000));
          setSecondsRemaining(remainingSecs);
        }

        if (previousToken && previousToken !== data.token) {
          // Token rotated!
        }
        previousToken = data.token;
      } catch (err) {
        console.error('Failed to fetch QR token', err);
      }
    };

    fetchToken();
    const interval = setInterval(fetchToken, 2000);

    // Smooth client-side 1s countdown tick
    const tickInterval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, [selectedSessionId]);

  // Active session object
  const currentSession = activeSessions.find((s) => s.id === selectedSessionId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <RefreshCw className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  // No active session view
  if (activeSessions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 max-w-lg shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600/20 text-brand-400 ring-1 ring-brand-500/40">
            <Tv2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">No Active Class Session</h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            There are currently no attendance sessions active. Please launch an attendance session from the <span className="font-semibold text-white">Admin Dashboard</span>.
          </p>
          <a
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-500"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Display Screen for Classroom Projector
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 20) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 lg:p-10 select-none">
      {/* Top Bar: Subject, Hour & Session Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE ATTENDANCE SESSION
            </span>
            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-300 border border-brand-500/20">
              Subject Hour {currentSession?.hour_number || 1} of 5
            </span>
          </div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-black tracking-tight text-white">
            {currentSession?.subject_name || 'Class Attendance'}
          </h1>
          {currentSession?.subject_code && (
            <p className="text-sm font-medium text-slate-400">
              Course Code: <span className="font-mono text-slate-200">{currentSession.subject_code}</span>
            </p>
          )}
        </div>

        {/* Multi-session hour switcher if multiple are active */}
        {activeSessions.length > 1 && (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900 p-1.5 border border-slate-800">
            {activeSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  selectedSessionId === s.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hour {s.hour_number}: {s.subject_name.slice(0, 14)}...
              </button>
            ))}
          </div>
        )}

        {/* Live Attendance Counter */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3 shadow-xl">
          <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{liveAttendanceCount}</div>
            <div className="text-xs font-medium text-slate-400">Students Logged</div>
          </div>
        </div>
      </div>

      {/* Main Display: Dynamic QR Code + Large Unique PIN */}
      <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto w-full py-6">
        {/* Left Column: Rotating Dynamic QR Code */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative rounded-3xl border-2 border-brand-500/40 bg-white p-5 shadow-2xl shadow-brand-500/10">
            {tokenData?.qr_code ? (
              <img
                src={tokenData.qr_code}
                alt="Dynamic Classroom QR"
                className="h-72 w-72 sm:h-80 sm:w-80 rounded-2xl object-contain transition-all duration-300"
              />
            ) : (
              <div className="flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center text-slate-400">
                <RefreshCw className="h-10 w-10 animate-spin text-brand-600" />
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-brand-600" />
              Auto-Rotates Every 18–20s
            </div>
          </div>

          {/* Rotation Countdown Bar */}
          <div className="mt-6 w-full max-w-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Next Refresh:
              </span>
              <span className="font-mono text-brand-400">{secondsRemaining}s</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Unique PIN & Instructions */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Unique PIN Display Box */}
          <div className="rounded-3xl border border-brand-500/40 bg-gradient-to-br from-brand-950/80 via-slate-900 to-indigo-950 p-6 sm:p-8 shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-300">
              Current Unique PIN
            </div>
            <div className="mt-3 text-6xl sm:text-7xl font-black tracking-widest text-white font-mono selection:bg-brand-500">
              {tokenData?.unique_pin || '------'}
            </div>
            <p className="mt-3 text-xs text-slate-300">
              Enter this 6-digit PIN together with your Student ID after scanning the QR.
            </p>
          </div>

          {/* Student Instructions */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3.5 text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              How to Mark Attendance:
            </h3>
            <ol className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white text-xs">
                  1
                </span>
                <span>Scan the dynamic QR code on the left using your smartphone camera.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white text-xs">
                  2
                </span>
                <span>
                  Enter your official <strong className="text-white">Student ID</strong> (e.g. <span className="font-mono text-brand-300">ABCD1234</span>).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white text-xs">
                  3
                </span>
                <span>
                  Enter the <strong className="text-white">Unique PIN</strong> ({tokenData?.unique_pin || '...'}) and tap Submit.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Anti-Proxy Protection Active — QR rotates every 18-20s • Single Entry per Student</span>
        </div>
        <div>
          <span>Powered by SQLite + node-cron</span>
        </div>
      </div>
    </div>
  );
}

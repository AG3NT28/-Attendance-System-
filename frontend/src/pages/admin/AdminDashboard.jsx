import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  Users, 
  Radio, 
  History, 
  Check, 
  Plus, 
  Square, 
  MapPin, 
  Terminal,
  Crosshair,
  ArrowUpRight,
  Clock,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form for starting a new class/subject session
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [hourNumber, setHourNumber] = useState('1');
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoRadius, setGeoRadius] = useState('100');

  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('admin_token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats', axiosConfig);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoLat(pos.coords.latitude.toFixed(6));
          setGeoLng(pos.coords.longitude.toFixed(6));
          setGeoEnabled(true);
        },
        (err) => {
          alert('GPS error: ' + err.message);
        }
      );
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    setCreating(true);
    setMsg('');

    try {
      const payload = {
        subject_name: subjectName.trim(),
        subject_code: subjectCode.trim(),
        hour_number: parseInt(hourNumber, 10),
        geo_fence_enabled: geoEnabled,
        geo_lat: geoEnabled ? geoLat : null,
        geo_lng: geoEnabled ? geoLng : null,
        geo_radius_m: geoEnabled ? parseInt(geoRadius, 10) : 100
      };

      await axios.post('/api/admin/sessions/start', payload, axiosConfig);
      setMsg(`Session activated: ${subjectName} [Hour ${hourNumber}]`);
      setSubjectName('');
      setSubjectCode('');
      fetchStats();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to start session');
    } finally {
      setCreating(false);
    }
  };

  const handleStopSession = async (sessionId) => {
    if (!window.confirm('Terminate this attendance session and close registration?')) return;

    try {
      await axios.post(`/api/admin/sessions/${sessionId}/stop`, {}, axiosConfig);
      fetchStats();
    } catch (err) {
      alert('Failed to stop session');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-mono text-zinc-100">
        
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <Terminal className="h-4 w-4" />
              SYSTEM OVERVIEW // CONSOLE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              Attendance Command Deck
            </h1>
          </div>
          
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-amber-400 bg-amber-400 px-4 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition"
          >
            <span>LAUNCH PROJECTOR HUD</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="border border-zinc-800 bg-[#111114] p-4 bracket-card">
            <div className="text-[10px] text-zinc-500 uppercase">ENROLLED STUDENTS</div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-white tabular-num font-mono">
              {stats?.total_students ?? '—'}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">DATABASE ROSTER</div>
          </div>

          <div className="border border-zinc-800 bg-[#111114] p-4 bracket-card">
            <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
              <span>ACTIVE QR LOOPS</span>
              <span className="h-2 w-2 rounded-full bg-signal-emerald animate-pulse"></span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-signal-emerald tabular-num font-mono">
              {stats?.active_sessions ?? '—'}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">ROTATING TOKENS</div>
          </div>

          <div className="border border-zinc-800 bg-[#111114] p-4 bracket-card">
            <div className="text-[10px] text-zinc-500 uppercase">TODAY ENTRIES</div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-400 tabular-num font-mono">
              {stats?.today_attendance ?? '—'}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">VERIFIED SUBMISSIONS</div>
          </div>

          <div className="border border-zinc-800 bg-[#111114] p-4 bracket-card">
            <div className="text-[10px] text-zinc-500 uppercase">TOTAL SESSIONS</div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-200 tabular-num font-mono">
              {stats?.total_sessions ?? '—'}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">RECORDED PERIODS</div>
          </div>
        </div>

        {/* Start Session Console + Active Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Start Session (5 cols) */}
          <div className="lg:col-span-5 border border-zinc-800 bg-[#111114] p-5 sm:p-6 bracket-card shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
              <Plus className="h-4 w-4 text-amber-400" />
              <span>INITIALIZE LECTURE PERIOD</span>
            </div>

            {msg && (
              <div className="mb-4 border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
                {msg}
              </div>
            )}

            <form onSubmit={handleStartSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Subject Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS401"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                    className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    Hour Slot
                  </label>
                  <select
                    value={hourNumber}
                    onChange={(e) => setHourNumber(e.target.value)}
                    className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none transition"
                  >
                    <option value="1">Hour 01</option>
                    <option value="2">Hour 02</option>
                    <option value="3">Hour 03</option>
                    <option value="4">Hour 04</option>
                    <option value="5">Hour 05</option>
                  </select>
                </div>
              </div>

              {/* Geofence Configuration */}
              <div className="border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold uppercase">
                    <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                    GPS GEOFENCE BOUNDARY
                  </span>
                  <input
                    type="checkbox"
                    checked={geoEnabled}
                    onChange={(e) => setGeoEnabled(e.target.checked)}
                    className="h-4 w-4 rounded-none accent-amber-400"
                  />
                </div>

                {geoEnabled && (
                  <div className="space-y-2.5 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="w-full border border-zinc-700 bg-zinc-900 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-zinc-800 transition"
                    >
                      [+] CAPTURE INSTRUCTOR GPS
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Latitude"
                        value={geoLat}
                        onChange={(e) => setGeoLat(e.target.value)}
                        className="border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Longitude"
                        value={geoLng}
                        onChange={(e) => setGeoLng(e.target.value)}
                        className="border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">RADIUS LIMIT (METERS)</span>
                      <input
                        type="number"
                        value={geoRadius}
                        onChange={(e) => setGeoRadius(e.target.value)}
                        className="w-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full border border-amber-400 bg-amber-400 py-3 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition active:translate-y-[1px] disabled:opacity-50"
              >
                {creating ? 'COMMENCING SESSION...' : 'START SESSION // ACTIVATE ROTATOR'}
              </button>
            </form>
          </div>

          {/* Right: Active Sessions (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-signal-emerald animate-pulse" />
                CONCURRENT LECTURE SESSIONS
              </span>
              <span className="text-zinc-500">STATUS: LIVE</span>
            </div>

            {stats?.recent_sessions?.filter((s) => s.is_active === 1).length === 0 ? (
              <div className="border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
                <div className="text-xs uppercase font-mono">No active classroom sessions</div>
                <div className="text-[11px] text-zinc-600 mt-1">
                  Start a period from the console on the left to begin rolling QR codes.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recent_sessions
                  ?.filter((s) => s.is_active === 1)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="border border-zinc-800 bg-[#111114] p-4 bracket-card shadow-lg flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="border border-signal-emerald/40 bg-signal-emerald/10 px-2 py-0.5 text-[10px] font-bold text-signal-emerald">
                            HOUR 0{session.hour_number}
                          </span>
                          <span className="text-zinc-500 text-[11px]">
                            {new Date(session.started_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="mt-1 text-base font-bold text-white font-sans uppercase">
                          {session.subject_name}
                        </h3>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {session.subject_code ? `[${session.subject_code}] • ` : ''}
                          {session.geo_fence_enabled ? 'GEOFENCE LOCKED' : 'GEOFENCE DISABLED'}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-400 tabular-num">
                            {session.attendance_count || 0}
                          </div>
                          <div className="text-[10px] text-zinc-500 uppercase">LOGGED</div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <a
                            href={`/admin/attendance?session=${session.id}`}
                            className="border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-center text-[10px] font-bold text-zinc-300 hover:border-amber-400 hover:text-amber-400 transition"
                          >
                            AUDIT LOG
                          </a>
                          <button
                            onClick={() => handleStopSession(session.id)}
                            className="border border-signal-crimson/50 bg-signal-crimson/10 px-3 py-1.5 text-[10px] font-bold text-red-300 hover:bg-signal-crimson hover:text-white transition"
                          >
                            STOP PERIOD
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Historical Sessions Summary */}
            <div className="mt-8 pt-4 border-t border-zinc-800">
              <div className="text-xs font-bold uppercase text-zinc-400 mb-3 flex items-center gap-2">
                <History className="h-3.5 w-3.5" />
                RECENT COMPLETED PERIODS
              </div>
              <div className="border border-zinc-800 bg-[#0d0d10] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-[10px]">
                      <th className="p-3">SUBJECT</th>
                      <th className="p-3">HOUR</th>
                      <th className="p-3">DATE / TIME</th>
                      <th className="p-3 text-right">TOTAL STUDENTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {stats?.recent_sessions?.filter(s => s.is_active === 0).slice(0, 5).map(s => (
                      <tr key={s.id} className="text-zinc-300 hover:bg-zinc-900/50">
                        <td className="p-3 font-semibold text-white">{s.subject_name}</td>
                        <td className="p-3 text-zinc-400">HOUR 0{s.hour_number}</td>
                        <td className="p-3 text-zinc-500">{new Date(s.started_at).toLocaleDateString()}</td>
                        <td className="p-3 text-right font-mono text-amber-400">{s.attendance_count || 0}</td>
                      </tr>
                    ))}
                    {(!stats?.recent_sessions || stats.recent_sessions.filter(s => s.is_active === 0).length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-zinc-600 text-[11px]">
                          No historical sessions logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}

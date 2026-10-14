import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  Users, 
  Radio, 
  History, 
  CheckCircle2, 
  PlusCircle, 
  StopCircle, 
  ExternalLink, 
  MapPin, 
  Sparkles,
  BookOpen
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
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Quick prefill coordinates using browser GPS
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoLat(pos.coords.latitude.toFixed(6));
          setGeoLng(pos.coords.longitude.toFixed(6));
          setGeoEnabled(true);
        },
        (err) => {
          alert('Could not access current GPS location: ' + err.message);
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
      setMsg(`Session started for ${subjectName} (Hour ${hourNumber})!`);
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
    if (!window.confirm('Are you sure you want to end this attendance session?')) return;

    try {
      await axios.post(`/api/admin/sessions/${sessionId}/stop`, {}, axiosConfig);
      fetchStats();
    } catch (err) {
      alert('Failed to stop session');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Classroom Attendance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Control 5 daily lecture hours, dynamic rolling QR passkeys, and geofence verification.
            </p>
          </div>
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition"
          >
            <Sparkles className="h-4 w-4" />
            Launch Projector Screen
          </a>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Students</span>
              <Users className="h-4 w-4 text-brand-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {stats?.total_students ?? '...'}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Registered in Roster</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Active Sessions</span>
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-400">
              {stats?.active_sessions ?? '...'}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Live QR Rotating Now</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Today's Attendance</span>
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {stats?.today_attendance ?? '...'}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Total verified submissions</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Sessions</span>
              <History className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {stats?.total_sessions ?? '...'}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Recorded historical classes</div>
          </div>
        </div>

        {/* Start New Session & Active Session Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form: Start Session (5 subjects / hours support) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="h-5 w-5 text-brand-400" />
              <h2 className="text-base font-bold text-white">Start New Subject Hour</h2>
            </div>

            {msg && (
              <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-xs font-medium text-brand-300">
                {msg}
              </div>
            )}

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Subject Name <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS302"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white uppercase focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Class Hour (1 to 5)
                  </label>
                  <select
                    value={hourNumber}
                    onChange={(e) => setHourNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="1">Hour 1 (Period 1)</option>
                    <option value="2">Hour 2 (Period 2)</option>
                    <option value="3">Hour 3 (Period 3)</option>
                    <option value="4">Hour 4 (Period 4)</option>
                    <option value="5">Hour 5 (Period 5)</option>
                  </select>
                </div>
              </div>

              {/* Geo-fencing toggle */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-400" />
                    <span className="text-xs font-bold text-slate-200">Classroom Geo-Fence</span>
                  </div>
                  <input
                    type="checkbox"
                    id="geo-toggle"
                    checked={geoEnabled}
                    onChange={(e) => setGeoEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500"
                  />
                </div>

                {geoEnabled && (
                  <div className="space-y-3 pt-2 text-xs">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="w-full rounded-xl bg-slate-800 py-1.5 font-semibold text-brand-300 hover:bg-slate-700"
                    >
                      📍 Set Classroom to My Current GPS
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Latitude"
                        value={geoLat}
                        onChange={(e) => setGeoLat(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Longitude"
                        value={geoLng}
                        onChange={(e) => setGeoLng(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Max Radius (Meters)</label>
                      <input
                        type="number"
                        value={geoRadius}
                        onChange={(e) => setGeoRadius(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition disabled:opacity-50"
              >
                {creating ? 'Starting Session...' : 'Start Session & Activate Rolling QR'}
              </button>
            </form>
          </div>

          {/* Active Sessions & Live Table Preview */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              Active Classroom Sessions
            </h2>

            {stats?.recent_sessions?.filter((s) => s.is_active === 1).length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                <p className="text-sm">No attendance sessions currently running.</p>
                <p className="text-xs mt-1">Start a session using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recent_sessions
                  ?.filter((s) => s.is_active === 1)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="rounded-2xl border border-brand-500/30 bg-slate-900/90 p-5 shadow-lg flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                            Hour {session.hour_number}
                          </span>
                          <span className="text-xs text-slate-400">
                            Started {new Date(session.started_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="mt-1 text-lg font-bold text-white">
                          {session.subject_name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {session.subject_code ? `Code: ${session.subject_code} • ` : ''}
                          {session.geo_fence_enabled ? '📍 Geofence ON' : 'Geofence OFF'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-black text-brand-400">
                            {session.attendance_count}
                          </div>
                          <div className="text-[11px] text-slate-400">Attended</div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <a
                            href={`/admin/attendance?session=${session.id}`}
                            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition text-center"
                          >
                            Live Table
                          </a>
                          <button
                            onClick={() => handleStopSession(session.id)}
                            className="flex items-center gap-1 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                          >
                            <StopCircle className="h-3.5 w-3.5" />
                            Stop
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Recent Closed Sessions */}
            <div className="pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Recent Closed Sessions
              </h3>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Hour</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Attendance</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {stats?.recent_sessions
                      ?.filter((s) => s.is_active === 0)
                      .slice(0, 5)
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-white">{s.subject_name}</td>
                          <td className="p-3">Hour {s.hour_number}</td>
                          <td className="p-3 text-slate-400">
                            {new Date(s.started_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-brand-400">
                            {s.attendance_count}
                          </td>
                          <td className="p-3 text-right">
                            <a
                              href={`/admin/attendance?session=${s.id}`}
                              className="text-brand-400 hover:underline"
                            >
                              View Table
                            </a>
                          </td>
                        </tr>
                      ))}
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

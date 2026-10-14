import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  Download, 
  Search, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  ShieldCheck, 
  Radio 
} from 'lucide-react';

export default function LiveAttendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionFromUrl = searchParams.get('session');

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(sessionFromUrl || '');
  const [sessionData, setSessionData] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLivePolling, setIsLivePolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Manual mark state
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMsg, setManualMsg] = useState('');

  const token = localStorage.getItem('admin_token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 1. Fetch all sessions for selector
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get('/api/admin/sessions', axiosConfig);
        const list = res.data.sessions || [];
        setSessions(list);

        if (!selectedSessionId && list.length > 0) {
          // Default to first active session, or first session
          const active = list.find((s) => s.is_active === 1) || list[0];
          setSelectedSessionId(String(active.id));
        }
      } catch (err) {
        console.error('Failed to load sessions', err);
      }
    };
    fetchSessions();
  }, []);

  // 2. Poll live attendance for selected session
  useEffect(() => {
    if (!selectedSessionId) return;

    setSearchParams({ session: selectedSessionId });

    const fetchLiveFeed = async () => {
      try {
        const res = await axios.get(`/api/attendance/live/${selectedSessionId}`);
        setSessionData(res.data.session);
        setRecords(res.data.records || []);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Failed to fetch live attendance', err);
      }
    };

    fetchLiveFeed();

    if (!isLivePolling) return;
    const interval = setInterval(fetchLiveFeed, 2500);
    return () => clearInterval(interval);
  }, [selectedSessionId, isLivePolling]);

  // Handle Delete Attendance Record
  const handleDeleteRecord = async (attendanceId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove attendance for ${studentName}?`)) return;

    try {
      await axios.delete(`/api/admin/attendance/${attendanceId}`, axiosConfig);
      setRecords((prev) => prev.filter((r) => r.id !== attendanceId));
    } catch (err) {
      alert('Failed to delete attendance record: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handle Manual Attendance Mark (for students with phone issues)
  const handleManualMark = async (e) => {
    e.preventDefault();
    if (!manualStudentId.trim() || !selectedSessionId) return;

    setManualLoading(true);
    setManualMsg('');

    try {
      const res = await axios.post(
        '/api/admin/attendance/manual-mark',
        {
          session_id: parseInt(selectedSessionId, 10),
          student_id: manualStudentId.trim()
        },
        axiosConfig
      );
      setManualMsg(res.data.message);
      setManualStudentId('');
      // Refresh
      const liveRes = await axios.get(`/api/attendance/live/${selectedSessionId}`);
      setRecords(liveRes.data.records || []);
    } catch (err) {
      setManualMsg(err.response?.data?.error || 'Failed to mark attendance manually');
    } finally {
      setManualLoading(false);
    }
  };

  // Handle CSV Export (SQLite-driven)
  const handleExportCSV = () => {
    if (!selectedSessionId) return;
    window.open(`/api/attendance/export/${selectedSessionId}`, '_blank');
  };

  // Filtered records by search term
  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(term) ||
      r.student_id?.toLowerCase().includes(term) ||
      r.usn?.toLowerCase().includes(term) ||
      r.department?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Live Attendance Table
              </h1>
              {sessionData?.is_active === 1 && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  STREAMING LIVE
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time synchronization with active QR scans. Detect errors and edit on the fly.
            </p>
          </div>

          {/* Action Buttons: Pause Polling, Export CSV */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLivePolling(!isLivePolling)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold border transition ${
                isLivePolling
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLivePolling ? 'animate-spin' : ''}`} />
              {isLivePolling ? 'Live Sync Active' : 'Sync Paused'}
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV (SQLite)
            </button>
          </div>
        </div>

        {/* Controls: Session Dropdown & Search & Manual Entry */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Session Selector */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Subject Session
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.is_active ? '🟢 [LIVE] ' : '⚪ [CLOSED] '} Hour {s.hour_number}: {s.subject_name} ({new Date(s.started_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Table Search */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Search Present Students
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, USN, or Student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Status Card */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 flex items-center justify-between text-xs text-slate-400">
              <span>Total Marked: <strong className="text-brand-400 font-mono text-sm">{records.length}</strong></span>
              <span>Updated: {lastUpdated || '...'}</span>
            </div>
          </div>
        </div>

        {/* Manual Mark Bar (For broken phones / error correction) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-bold text-white">Manual Attendance Override</span>
              <span className="text-[11px] text-slate-400">(In case student device had battery/network error)</span>
            </div>
            <form onSubmit={handleManualMark} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter Student ID (e.g. ABCD1234)"
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value.toUpperCase())}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs text-white uppercase font-mono focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={manualLoading}
                className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50"
              >
                {manualLoading ? 'Marking...' : 'Mark Present'}
              </button>
            </form>
          </div>
          {manualMsg && (
            <p className="mt-2 text-xs font-medium text-brand-300">{manualMsg}</p>
          )}
        </div>

        {/* Live Attendance Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">USN / Admission No</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Year / Cycle</th>
                  <th className="p-4">Time Logged</th>
                  <th className="p-4">Geofence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      {searchTerm
                        ? 'No students matching your search criteria.'
                        : 'No attendance records logged yet for this session.'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-xs text-slate-500">{index + 1}</td>
                      <td className="p-4 font-semibold text-white">{r.name}</td>
                      <td className="p-4 font-mono font-bold text-brand-400">{r.student_id}</td>
                      <td className="p-4 font-mono text-xs text-slate-300">{r.usn}</td>
                      <td className="p-4 text-xs text-slate-300">{r.department}</td>
                      <td className="p-4 text-xs">
                        Year {r.year} {r.cycle ? `(${r.cycle})` : ''}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(r.marked_at).toLocaleTimeString()}
                      </td>
                      <td className="p-4 text-xs">
                        {r.geo_verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-slate-500">Standard</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteRecord(r.id, r.name)}
                          title="Remove error record"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

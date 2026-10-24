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
  Check, 
  AlertCircle, 
  Radio, 
  Terminal,
  Crosshair,
  ArrowDownToLine
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
    if (!window.confirm(`Revoke verified attendance for "${studentName}"?`)) return;

    try {
      await axios.delete(`/api/admin/attendance/${attendanceId}`, axiosConfig);
      setRecords((prev) => prev.filter((r) => r.id !== attendanceId));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handle Manual Attendance Mark
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
      const liveRes = await axios.get(`/api/attendance/live/${selectedSessionId}`);
      setRecords(liveRes.data.records || []);
    } catch (err) {
      setManualMsg(err.response?.data?.error || 'Manual override failed');
    } finally {
      setManualLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedSessionId) return;
    window.open(`/api/attendance/export/${selectedSessionId}`, '_blank');
  };

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
      <div className="space-y-6 font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <Radio className="h-4 w-4 animate-pulse text-signal-emerald" />
              LIVE TELEMETRY // LEDGER AUDIT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              Attendance Audit Stream
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLivePolling(!isLivePolling)}
              className={`flex items-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                isLivePolling
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLivePolling ? 'animate-spin' : ''}`} />
              {isLivePolling ? 'STREAM: LIVE' : 'STREAM: PAUSED'}
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 border border-amber-400 bg-amber-400 px-3.5 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              EXPORT CSV
            </button>
          </div>
        </div>

        {/* Filters & Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          {/* Session Selector */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              TARGET PERIOD / SESSION
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none transition"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.is_active ? '● [ACTIVE] ' : '○ [CLOSED] '} Hour {s.hour_number}: {s.subject_name} ({new Date(s.started_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              SEARCH LOGGED RECORDS
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Name, USN, or Student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Sync Stats */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <div className="border border-zinc-800 bg-[#111114] p-2.5 flex items-center justify-between text-xs">
              <span className="text-zinc-400">TOTAL: <strong className="text-amber-400">{records.length}</strong></span>
              <span className="text-zinc-500 text-[11px]">TICK: {lastUpdated || '—'}</span>
            </div>
          </div>
        </div>

        {/* Manual Override Bar */}
        <div className="border border-zinc-800 bg-[#111114] p-3.5 bracket-card text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-white uppercase tracking-wider">MANUAL OVERRIDE:</span>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">(For hardware/network failures)</span>
            </div>
            <form onSubmit={handleManualMark} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="STUDENT ID"
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value.toUpperCase())}
                className="border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white uppercase focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={manualLoading}
                className="border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 uppercase hover:bg-zinc-700 transition"
              >
                {manualLoading ? 'MARKING...' : 'FORCE MARK'}
              </button>
            </form>
          </div>
          {manualMsg && (
            <div className="mt-2 text-[11px] text-amber-300">
              {manualMsg}
            </div>
          )}
        </div>

        {/* Data Ledger Table */}
        <div className="border border-zinc-800 bg-[#111114] overflow-x-auto bracket-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                <th className="p-3">#</th>
                <th className="p-3">STUDENT NAME</th>
                <th className="p-3">STUDENT ID</th>
                <th className="p-3">USN</th>
                <th className="p-3">DEPARTMENT</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">VERIFICATION METHOD</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredRecords.map((r, i) => (
                <tr key={r.id} className="text-zinc-300 hover:bg-zinc-900/40">
                  <td className="p-3 text-zinc-600 font-mono text-[11px]">{String(i + 1).padStart(2, '0')}</td>
                  <td className="p-3 font-semibold text-white">{r.name}</td>
                  <td className="p-3 font-bold text-amber-400 font-mono">{r.student_id}</td>
                  <td className="p-3 text-zinc-400 font-mono">{r.usn}</td>
                  <td className="p-3 text-zinc-400 truncate max-w-[150px]">{r.department}</td>
                  <td className="p-3 text-zinc-500 font-mono text-[11px]">
                    {new Date(r.marked_at).toLocaleTimeString()}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 border border-signal-emerald/30 bg-signal-emerald/10 px-2 py-0.5 text-[10px] font-bold text-signal-emerald">
                      <Check className="h-3 w-3 stroke-[3]" />
                      QR_TOKEN
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteRecord(r.id, r.name)}
                      className="border border-zinc-800 bg-zinc-900 p-1 text-zinc-500 hover:border-signal-crimson hover:text-signal-crimson transition"
                      title="Revoke entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-600 text-xs">
                    No verified attendance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}

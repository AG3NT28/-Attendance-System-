import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Users, Search, Trash2, Filter, Terminal, UserCheck } from 'lucide-react';

export default function StudentRoster() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('admin_token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (yearFilter) params.year = yearFilter;

      const res = await axios.get('/api/admin/students', {
        ...axiosConfig,
        params
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to load roster', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [yearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Permanently remove "${studentName}" (${studentId}) from directory?`)) return;

    try {
      await axios.delete(`/api/admin/students/${studentId}`, axiosConfig);
      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-mono text-zinc-100">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <Users className="h-4 w-4" />
              DATABASE ROSTER // STUDENT_DIRECTORY
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
              Enrolled Students Ledger
            </h1>
          </div>
          <div className="border border-zinc-800 bg-[#111114] px-4 py-2 text-xs">
            TOTAL ENROLLED: <span className="text-amber-400 font-bold tabular-num">{students.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-8 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search name, USN, or Student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 uppercase hover:bg-zinc-700 transition"
            >
              FILTER
            </button>
          </form>

          <div className="sm:col-span-4">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none transition"
            >
              <option value="">ALL ACADEMIC YEARS</option>
              <option value="1">YEAR 1 (FRESHMAN)</option>
              <option value="2">YEAR 2 (SOPHOMORE)</option>
              <option value="3">YEAR 3 (JUNIOR)</option>
              <option value="4">YEAR 4 (SENIOR)</option>
            </select>
          </div>
        </div>

        {/* Roster Table */}
        <div className="border border-zinc-800 bg-[#111114] overflow-x-auto bracket-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                <th className="p-3">#</th>
                <th className="p-3">STUDENT NAME</th>
                <th className="p-3">STUDENT ID</th>
                <th className="p-3">USN / ADMISSION ID</th>
                <th className="p-3">DEPARTMENT</th>
                <th className="p-3">YEAR / CYCLE</th>
                <th className="p-3">CONTACT</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {students.map((s, i) => (
                <tr key={s.id} className="text-zinc-300 hover:bg-zinc-900/40">
                  <td className="p-3 text-zinc-600 font-mono text-[11px]">{String(i + 1).padStart(2, '0')}</td>
                  <td className="p-3 font-semibold text-white">{s.name}</td>
                  <td className="p-3 font-bold text-amber-400 font-mono tracking-wider">{s.student_id}</td>
                  <td className="p-3 text-zinc-400 font-mono">{s.usn}</td>
                  <td className="p-3 text-zinc-400 truncate max-w-[150px]">{s.department}</td>
                  <td className="p-3 text-zinc-400">
                    YEAR {s.year} {s.cycle ? `(${s.cycle})` : ''}
                  </td>
                  <td className="p-3 text-zinc-500 font-mono text-[11px]">{s.mobile}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteStudent(s.student_id, s.name)}
                      className="border border-zinc-800 bg-zinc-900 p-1 text-zinc-500 hover:border-signal-crimson hover:text-signal-crimson transition"
                      title="Delete student"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-600 text-xs">
                    {loading ? 'LOADING ROSTER...' : 'NO ENROLLED STUDENTS FOUND.'}
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

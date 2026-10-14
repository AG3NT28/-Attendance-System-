import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Users, Search, Trash2, Filter, GraduationCap } from 'lucide-react';

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
    if (!window.confirm(`Are you sure you want to delete student "${studentName}" (${studentId}) from the roster?`)) return;

    try {
      await axios.delete(`/api/admin/students/${studentId}`, axiosConfig);
      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Roster Database
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Registered students with auto-generated Student IDs.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300">
            Total Enrolled: <span className="font-mono text-brand-400 font-bold">{students.length}</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-8 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Name, USN, Student ID, or Mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition"
            >
              Search
            </button>
          </form>

          <div className="sm:col-span-4">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Academic Years</option>
              <option value="1">1st Year Students</option>
              <option value="2">2nd Year Students</option>
              <option value="3">3rd Year Students</option>
              <option value="4">4th Year Students</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
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
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Loading student roster...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No students found in roster database.
                    </td>
                  </tr>
                ) : (
                  students.map((s, index) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-xs text-slate-500">{index + 1}</td>
                      <td className="p-4 font-semibold text-white">{s.name}</td>
                      <td className="p-4 font-mono font-bold text-brand-400">{s.student_id}</td>
                      <td className="p-4 font-mono text-xs text-slate-300">{s.usn}</td>
                      <td className="p-4 text-xs text-slate-300">{s.department}</td>
                      <td className="p-4 text-xs">
                        Year {s.year} {s.cycle ? `(${s.cycle})` : ''}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-400">{s.mobile}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(s.student_id, s.name)}
                          title="Delete from roster"
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

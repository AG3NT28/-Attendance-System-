import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  IdCard, 
  Phone, 
  Building2, 
  GraduationCap, 
  Layers 
} from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key') || '';

  const [isVerifyingKey, setIsVerifyingKey] = useState(true);
  const [isKeyValid, setIsKeyValid] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    department: 'Computer Science and Engineering',
    year: '1',
    cycle: 'Physics',
    mobile: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredStudent, setRegisteredStudent] = useState(null);

  // Verify registration key on page load
  useEffect(() => {
    if (!key) {
      setIsVerifyingKey(false);
      setIsKeyValid(false);
      return;
    }

    axios
      .get(`/api/registration-key/verify?key=${encodeURIComponent(key)}`)
      .then((res) => {
        if (res.data.valid) {
          setIsKeyValid(true);
        }
      })
      .catch(() => {
        setIsKeyValid(false);
      })
      .finally(() => {
        setIsVerifyingKey(false);
      });
  }, [key]);

  // Compute Student ID dynamically
  const dynamicStudentID = useMemo(() => {
    const cleanName = (formData.name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    const namePart = cleanName.length >= 4 
      ? cleanName.substring(0, 4) 
      : (cleanName ? cleanName.padEnd(4, '•') : '••••');

    const cleanMobile = (formData.mobile || '').replace(/\D/g, '');
    const mobilePart = cleanMobile.length >= 4 
      ? cleanMobile.slice(-4) 
      : (cleanMobile ? cleanMobile.padStart(4, '•') : '••••');

    return `${namePart}${mobilePart}`;
  }, [formData.name, formData.mobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        key,
        name: formData.name.trim(),
        usn: formData.usn.trim(),
        department: formData.department,
        year: parseInt(formData.year, 10),
        cycle: formData.year === '1' ? formData.cycle : null,
        mobile: formData.mobile.replace(/\D/g, '')
      };

      const res = await axios.post('/api/register', payload);
      setRegisteredStudent(res.data.student);
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check your details.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading key verification state
  if (isVerifyingKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-300">Verifying secure QR registration token...</p>
        </div>
      </div>
    );
  }

  // 2. Access Denied: not accessed via secret admin QR
  if (!isKeyValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">Access Restricted</h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            This student registration portal is strictly protected and can only be accessed by scanning the official <span className="font-semibold text-slate-200">Admin Static QR Code</span>.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-800/60 p-4 text-xs text-slate-400 border border-slate-700/50">
            Please contact your department faculty or administrator to scan the authorized physical registration QR code.
          </div>
        </div>
      </div>
    );
  }

  // 3. Success Screen
  if (registeredStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-lg rounded-3xl border border-brand-500/30 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-white">
            Registration Successful!
          </h2>
          <p className="mt-1 text-center text-sm text-slate-400">
            Your profile has been registered in the attendance database.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-brand-500/40 bg-gradient-to-br from-brand-950/80 to-slate-900 p-6 shadow-inner text-center">
            <span className="text-xs font-semibold tracking-wider text-brand-300 uppercase">
              Your Official Student ID
            </span>
            <div className="mt-2 text-4xl font-black tracking-widest text-white font-mono selection:bg-brand-500">
              {registeredStudent.student_id}
            </div>
            <p className="mt-3 text-xs text-slate-300">
              Derived from first 4 letters of your name (full caps) + last 4 digits of your mobile.
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-slate-800/40 p-4 text-xs text-slate-300 border border-slate-700/40">
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">Student Name:</span>
              <span className="font-semibold text-white">{registeredStudent.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">USN / Admission No:</span>
              <span className="font-semibold text-white">{registeredStudent.usn}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-white">{registeredStudent.department}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">Year / Cycle:</span>
              <span className="font-semibold text-white">
                Year {registeredStudent.year} {registeredStudent.cycle ? `(${registeredStudent.cycle} Cycle)` : ''}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Registered Mobile:</span>
              <span className="font-semibold text-white">{registeredStudent.mobile}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
            <p className="text-xs font-medium text-amber-300">
              ⚠️ Important: Please screenshot or write down your <span className="font-bold underline">{registeredStudent.student_id}</span>. You will enter this Student ID and the classroom screen's PIN to mark your attendance!
            </p>
          </div>

          <button
            onClick={() => {
              setRegisteredStudent(null);
              setFormData({
                name: '',
                usn: '',
                department: 'Computer Science and Engineering',
                year: '1',
                cycle: 'Physics',
                mobile: ''
              });
            }}
            className="mt-6 w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-500 active:scale-[0.99]"
          >
            Register Another Student
          </button>
        </div>
      </div>
    );
  }

  // 4. Main Registration Form
  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400 ring-1 ring-brand-500/40">
            <UserCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white">
            Student Roster Registration
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            One-time registration for automated dynamic QR classroom attendance.
          </p>
        </div>

        {/* Dynamic ID Calculation Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 p-5 shadow-xl">
          <div className="flex items-center gap-2 text-brand-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Live Student ID Preview</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black tracking-widest text-white font-mono">
                {dynamicStudentID}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Formula: First 4 letters of your Name (CAPS) + Last 4 digits of Mobile
              </p>
            </div>
            <div className="hidden sm:block rounded-xl bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300 border border-brand-500/20">
              Auto-Generated
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                />
              </div>
              <span className="mt-1 block text-[11px] text-slate-500">
                First 4 alphabets will form the prefix of your Student ID.
              </span>
            </div>

            {/* USN / Admission Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                USN / Admission Number <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="usn"
                  required
                  placeholder="e.g. 1MS21CS045 or ADM-2024-001"
                  value={formData.usn}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white uppercase placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Department <span className="text-brand-400">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              >
                <option value="Computer Science and Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Information Science and Engineering">Information Science & Engineering (ISE)</option>
                <option value="Artificial Intelligence and Data Science">AI & Data Science (AI/DS)</option>
                <option value="Electronics and Communication">Electronics & Communication (ECE)</option>
                <option value="Electrical and Electronics">Electrical & Electronics (EEE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                <option value="Biotechnology">Biotechnology</option>
              </select>
            </div>

            {/* Year & Cycle (in grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Year of Study <span className="text-brand-400">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              {/* Cycle: ONLY visible and applicable if 1st Year */}
              {formData.year === '1' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-300 mb-1.5">
                    Cycle (1st Year Only) <span className="text-brand-400">*</span>
                  </label>
                  <select
                    name="cycle"
                    value={formData.cycle}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-500/50 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                  >
                    <option value="Physics">Physics Cycle</option>
                    <option value="Chemistry">Chemistry Cycle</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center text-xs text-slate-500 pt-7">
                  <span>Cycle is only applicable to 1st year students.</span>
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Mobile Number <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                />
              </div>
              <span className="mt-1 block text-[11px] text-slate-500">
                Last 4 digits will form the suffix of your Student ID.
              </span>
            </div>

            {/* Information Notice */}
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 p-4 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200">Notice:</span> By clicking Register, your unique Student ID will be enrolled. You do not need any password or login — you will mark attendance directly by scanning the dynamic classroom QR code and typing your Student ID and Unique PIN.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-500 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Registering Student...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

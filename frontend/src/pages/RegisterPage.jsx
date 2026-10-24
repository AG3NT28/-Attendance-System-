import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import { 
  UserCheck, 
  ShieldAlert, 
  Check, 
  Phone, 
  Building2, 
  GraduationCap, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  Copy,
  Zap,
  Star,
  Flame
} from 'lucide-react';
import RetroHeader from '../components/RetroHeader';

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
  const [copied, setCopied] = useState(false);

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

  // Compute Student ID dynamically: NAME[0:4] + MOBILE[-4:]
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
      const msg = err.response?.data?.error || 'Registration failed. Check if USN or Mobile is already registered.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (registeredStudent?.student_id) {
      navigator.clipboard.writeText(registeredStudent.student_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. Loading key verification state
  if (isVerifyingKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-zinc-300 font-mono">
        <div className="border-2 border-black bg-[#150d24] p-6 text-center shadow-brutal-amber">
          <Star className="h-6 w-6 text-retro-yellow mx-auto animate-pulse mb-3 fill-retro-yellow" />
          <p className="font-righteous text-xs uppercase tracking-wider text-white">VERIFYING REGISTRATION PORTAL...</p>
        </div>
      </div>
    );
  }

  // 2. Access Denied: not accessed via secret admin QR
  if (!isKeyValid) {
    return (
      <div className="min-h-screen bg-transparent p-4 flex flex-col justify-between font-sans">
        <RetroHeader />
        <div className="my-auto mx-auto w-full max-w-md border-2 border-black bg-[#150d24] p-8 text-center shadow-brutal-amber ring-light">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-black bg-retro-pink text-white shadow-brutal mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-righteous text-white uppercase tracking-wide">
            Access Restricted!
          </h2>
          <p className="mt-2 text-xs text-purple-200 font-mono leading-relaxed">
            You must scan the authorized registration QR code at the MVJCE Talent's Day auditorium entrance.
          </p>
          <div className="mt-5 border-2 border-black bg-black p-3 text-[11px] font-mono text-purple-300 text-left">
            URL REQUIREMENT: <span className="text-retro-yellow font-bold">?key=STATIC_REG_QR_KEY</span>
          </div>
        </div>
        <footer className="text-center text-[10px] font-mono text-zinc-600 pb-4">
          MVJCE TALENT'S DAY 2026 // ATTENDANCE PROTOCOL
        </footer>
      </div>
    );
  }

  // 3. Success Screen: Student Identity Card Display
  if (registeredStudent) {
    return (
      <div className="min-h-screen bg-transparent text-zinc-100 p-4 sm:p-6 flex flex-col justify-between font-sans">
        <RetroHeader />

        <div className="my-auto mx-auto w-full max-w-md rounded-2xl border-2 border-black bg-[#150d24] p-6 sm:p-8 shadow-brutal-amber beam-ring ring-light">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black font-mono text-xs">
            <span className="font-righteous text-retro-yellow flex items-center gap-1.5 font-bold">
              <Star className="h-4 w-4 fill-retro-yellow stroke-black" />
              MVJCE TALENT PASS ISSUED
            </span>
            <span className="border border-black bg-retro-purple text-white px-2 py-0.5 text-[10px] font-righteous">
              VERIFIED 2026
            </span>
          </div>

          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-black bg-retro-yellow text-black shadow-brutal mb-3 stand-glow">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h2 className="text-3xl font-righteous uppercase text-white tracking-wide text-jojo-gold">
              Pass Confirmed!
            </h2>
            <p className="text-xs text-purple-300 mt-1 font-mono">
              Your official MVJCE Talent's Day identifier has been synthesized.
            </p>
          </div>

          {/* Physical Badge Render */}
          <div className="border-2 border-black bg-black p-5 relative shadow-brutal-amber mb-6 font-mono">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">MVJCE STUDENT PASS KEY</div>
                <div className="text-3xl font-righteous text-retro-yellow tracking-wider mt-1 drop-shadow-[2px_2px_0px_#000]">
                  {registeredStudent.student_id}
                </div>
              </div>
              <Cpu className="h-7 w-7 text-retro-pink stroke-[1.5]" />
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300 border-t-2 border-zinc-900 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">NAME:</span>
                <span className="font-bold text-white">{registeredStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">USN:</span>
                <span className="font-mono text-zinc-300">{registeredStudent.usn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">DEPT:</span>
                <span className="text-zinc-300 truncate max-w-[180px]">{registeredStudent.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">YEAR:</span>
                <span className="text-zinc-300">YEAR {registeredStudent.year}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <button
              onClick={handleCopyId}
              className="w-full btn-funky bg-retro-yellow text-black py-3 text-xs font-righteous uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'COPIED TO CLIPBOARD!' : 'COPY MY STUDENT ID'}
            </button>

            <a
              href="/scan"
              className="w-full btn-funky bg-retro-pink text-white py-3 text-xs font-righteous uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>PROCEED TO ATTENDANCE SCAN</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </a>
          </div>
        </div>

        <footer className="text-center text-[10px] font-mono text-purple-400 pb-2">
          KEEP YOUR STUDENT ID HANDY FOR EVERY SCAN
        </footer>
      </div>
    );
  }

  // 4. Registration Form with Live Holographic Student ID Preview
  return (
    <div className="min-h-screen bg-transparent text-zinc-100 px-3.5 sm:px-6 py-5 sm:py-10 flex flex-col items-center justify-center font-sans">
      
      {/* Outer Retro Framed Window */}
      <div className="max-w-[460px] lg:max-w-5xl mx-auto w-full rounded-2xl border-2 border-black bg-[#120c1f]/95 backdrop-blur-md shadow-brutal-amber beam-ring ring-light overflow-hidden flex flex-col my-auto relative z-10">
        
        {/* Top Tabbed Navigation Bar */}
        <RetroHeader />

        {/* Inner Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-t-2 border-black">
          
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 p-4 sm:p-8 lg:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-[#160e29]">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-black bg-retro-yellow text-black text-[10px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                  <Star className="h-3 w-3 fill-black" />
                  MVJCE • TALENT'S DAY
                </div>
                <span className="font-righteous text-xs text-retro-pink">
                  ★ 2026 ★
                </span>
              </div>

              <h1 className="font-righteous text-3xl sm:text-4xl tracking-wide text-white drop-shadow-[2px_2px_0px_#000] uppercase text-jojo-gold">
                Talent Pass Registration
              </h1>
              <p className="mt-1 text-xs text-purple-200 font-mono">
                Fill details once to synthesize your permanent MVJCE festival attendance identifier.
              </p>
            </div>

            {/* Attendance Scan Helper Banner */}
            <div className="mb-4 flex items-center justify-between border-2 border-black bg-[#1f1438] px-3 py-2 text-xs font-mono shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-1.5 text-[11px] text-purple-200">
                <Zap className="h-3.5 w-3.5 fill-retro-yellow text-black shrink-0" />
                <span>Already registered your ID?</span>
              </div>
              <NavLink
                to="/scan"
                className="font-righteous text-[11px] text-retro-yellow hover:text-white underline underline-offset-2 flex items-center gap-1 shrink-0 uppercase tracking-wider"
              >
                <span>MARK ATTENDANCE</span>
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </NavLink>
            </div>

            {errorMsg && (
              <div className="mb-5 border-2 border-black bg-retro-pink/20 text-red-200 p-3 text-xs font-mono shadow-[2px_2px_0px_#000]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Full Name <span className="text-retro-yellow">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Jotaro Kujo"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-black bg-black px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
                />
              </div>

              {/* USN */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  USN / Admission ID <span className="text-retro-yellow">*</span>
                </label>
                <input
                  type="text"
                  name="usn"
                  required
                  placeholder="e.g. 1MS21CS045"
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                  className="w-full border-2 border-black bg-black px-3.5 py-2.5 text-sm uppercase text-white placeholder-zinc-700 shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Department <span className="text-retro-yellow">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border-2 border-black bg-black px-3.5 py-2.5 text-sm text-white shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
                >
                  <option value="Computer Science and Engineering">Computer Science & Engineering</option>
                  <option value="Information Science and Engineering">Information Science & Engineering</option>
                  <option value="Electronics and Communication">Electronics & Communication</option>
                  <option value="Electrical and Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Artificial Intelligence and Data Science">AI & Data Science</option>
                </select>
              </div>

              {/* Year & Cycle Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                    Year of Study <span className="text-retro-yellow">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full border-2 border-black bg-black px-3.5 py-2 text-sm text-white shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
                  >
                    <option value="1">Year 1 (Freshman)</option>
                    <option value="2">Year 2 (Sophomore)</option>
                    <option value="3">Year 3 (Junior)</option>
                    <option value="4">Year 4 (Senior)</option>
                  </select>
                </div>

                {formData.year === '1' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                      Cycle <span className="text-retro-yellow">*</span>
                    </label>
                    <select
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleChange}
                      className="w-full border-2 border-black bg-black px-3.5 py-2 text-sm text-white shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
                    >
                      <option value="Physics">Physics Cycle</option>
                      <option value="Chemistry">Chemistry Cycle</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Mobile Number (10 Digits) <span className="text-retro-yellow">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full border-2 border-black bg-black px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition font-mono"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-funky bg-retro-yellow text-black py-3.5 text-xs font-righteous uppercase tracking-wider hover:bg-yellow-300 transition flex items-center justify-center gap-2 mt-2 stand-glow"
              >
                {loading ? 'SYNTHESIZING PASS...' : 'GENERATE MVJCE TALENT PASS'}
              </button>
            </form>
          </div>

          {/* Right Column: Live MVJCE Talent Pass Preview (5 cols) */}
          <div className="lg:col-span-5 bg-checker-dark bg-checker-sm p-6 sm:p-8 flex flex-col justify-between font-mono bg-[#1c1236]">
            <div>
              <div className="flex items-center justify-between text-xs pb-3 border-b-2 border-black">
                <span className="font-righteous text-retro-yellow uppercase">MVJCE TALENT PASS PREVIEW</span>
                <span className="border border-black bg-retro-pink text-white px-2 py-0.5 text-[10px] font-bold shadow-[1px_1px_0px_#000]">
                  LIVE_CARD
                </span>
              </div>

              {/* Digital Pass Card with Golden Beam Ring */}
              <div className="mt-6 border-2 border-black bg-black p-5 relative shadow-brutal-pink beam-ring ring-light">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-purple-400 uppercase font-bold">SYNTHESIZED IDENTIFIER</div>
                    <div className="text-3xl font-righteous text-retro-yellow tracking-wider mt-1 drop-shadow-[2px_2px_0px_#000]">
                      {dynamicStudentID}
                    </div>
                  </div>
                  <Cpu className="h-7 w-7 text-retro-pink stroke-[1.5]" />
                </div>

                <div className="mt-5 border-t-2 border-zinc-900 pt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">NAME</span>
                    <span className="font-bold text-white truncate block">
                      {formData.name || 'MVJCE STUDENT'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] block">USN</span>
                    <span className="text-zinc-300 font-mono block">
                      {formData.usn || '••••••••••'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] block">DEPARTMENT</span>
                    <span className="text-zinc-400 text-[11px] truncate block">
                      {formData.department}
                    </span>
                  </div>
                </div>

                {/* Magnetic bar with star watermark */}
                <div className="mt-5 pt-3 border-t-2 border-dashed border-zinc-800 flex items-center justify-between text-[9px] text-zinc-500">
                  <span className="flex items-center gap-1 font-bold text-retro-yellow">
                    <Star className="h-3 w-3 fill-retro-yellow stroke-black inline" />
                    MVJCE TALENT'S DAY 2026
                  </span>
                  <span>FESTIVAL_PASS</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-2 border-black bg-[#150d24] p-3.5 shadow-[2px_2px_0px_#000] text-[11px] text-purple-200 leading-relaxed">
              💡 <strong className="text-retro-yellow">ID Formula</strong>: First 4 characters of your name + last 4 digits of your phone number.
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
            MVJ COLLEGE OF ENGINEERING // TALENT'S DAY ATTENDANCE
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

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import { 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  Camera, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Radio, 
  Star, 
  Zap,
  Flame
} from 'lucide-react';
import RetroHeader from '../components/RetroHeader';
import QRScannerModal from '../components/QRScannerModal';

export default function ScanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [studentId, setStudentId] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [activePinIndex, setActivePinIndex] = useState(0);
  const pinInputRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'already_marked' | 'error'
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleScanSuccess = (scannedToken) => {
    setToken(scannedToken);
    setSearchParams({ token: scannedToken });
  };

  const handlePinChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = cleanVal;
    setPinDigits(newDigits);

    if (cleanVal && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
      setActivePinIndex(index + 1);
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
      setActivePinIndex(index - 1);
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setPinDigits(newDigits);
    const nextEmpty = newDigits.findIndex(d => !d);
    if (nextEmpty !== -1) {
      pinInputRefs.current[nextEmpty]?.focus();
      setActivePinIndex(nextEmpty);
    } else {
      pinInputRefs.current[5]?.focus();
      setActivePinIndex(5);
    }
  };

  const fullPin = pinDigits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('No active QR token linked! Aim your camera at the classroom projector screen.');
      return;
    }
    if (!studentId.trim()) {
      setErrorMsg('Please input your official Student ID (e.g. ABCD1234).');
      return;
    }
    if (fullPin.length !== 6) {
      setErrorMsg('Enter all 6 digits of the classroom rolling PIN.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        token: token.trim(),
        student_id: studentId.trim().toUpperCase(),
        unique_pin: fullPin,
        lat: coords?.lat,
        lng: coords?.lng
      };

      const res = await axios.post('/api/attendance/mark', payload);
      setStatus('success');
      setResultData(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setStatus('already_marked');
        setResultData(err.response.data);
      } else {
        setStatus('error');
        setErrorMsg(err.response?.data?.error || 'Verification failed. The 19s PIN or token has expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStatus(null);
    setResultData(null);
    setErrorMsg('');
    setPinDigits(['', '', '', '', '', '']);
    setTimeout(() => {
      pinInputRefs.current[0]?.focus();
      setActivePinIndex(0);
    }, 50);
  };

  // SUCCESS STATE: Official MVJCE Talent's Day Verified Ticket
  if (status === 'success' && resultData) {
    return (
      <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 font-mono relative overflow-hidden">
        {/* Floating background ambient stars */}
        <div className="pointer-events-none absolute top-10 left-10 text-6xl text-purple-900/40 font-righteous select-none">
          ★
        </div>
        <div className="pointer-events-none absolute bottom-10 right-10 text-6xl text-amber-500/20 font-righteous select-none">
          ✦
        </div>

        <div className="w-full max-w-md rounded-2xl border-2 border-black bg-[#150d24] p-6 sm:p-8 shadow-brutal-amber beam-ring ring-light relative">
          
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <span className="font-righteous text-sm text-retro-yellow flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-retro-yellow stroke-black" />
              MVJCE • TALENT'S DAY 2026
            </span>
            <span className="border border-black bg-retro-pink text-white px-2.5 py-0.5 text-xs font-righteous">
              VERIFIED ENTRY
            </span>
          </div>

          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-black bg-retro-yellow text-black shadow-brutal mb-3 stand-glow">
              <Flame className="h-9 w-9 fill-retro-yellow stroke-black stroke-[2]" />
            </div>
            <h2 className="text-3xl font-righteous tracking-wide text-white uppercase text-jojo-gold">
              Attendance Logged!
            </h2>
            <p className="text-xs text-purple-300 mt-1 font-mono">
              Welcome to MVJCE Talent's Day Festival! Entry confirmed.
            </p>
          </div>

          {/* Perforated ticket divider */}
          <div className="relative my-3 border-t-2 border-dashed border-purple-800">
            <div className="absolute -top-3 -left-10 h-6 w-6 rounded-full bg-[#0b0714] border-2 border-black"></div>
            <div className="absolute -top-3 -right-10 h-6 w-6 rounded-full bg-[#0b0714] border-2 border-black"></div>
          </div>

          {/* Verified Data Table */}
          <div className="py-3 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-baseline">
              <span className="text-purple-400 uppercase">STUDENT DELEGATE</span>
              <span className="font-bold text-white text-right">{resultData.student?.name}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-purple-400 uppercase">STUDENT USN / ID</span>
              <span className="font-bold text-retro-yellow font-mono px-2 py-0.5 border border-black bg-black">
                {resultData.student?.student_id}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-purple-400 uppercase">EVENT SESSION</span>
              <span className="text-zinc-200">{resultData.session?.subject_name}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-purple-400 uppercase">AUDITORIUM PERIOD</span>
              <span className="font-bold text-retro-pink">STAGE HOUR 0{resultData.session?.hour_number}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-purple-400 uppercase">VERIFIED TIME</span>
              <span className="text-zinc-400">{new Date(resultData.marked_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="mt-6 w-full btn-funky bg-retro-yellow text-black py-3.5 text-xs font-righteous uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            LOG ANOTHER STUDENT
          </button>
        </div>
      </div>
    );
  }

  // ALREADY MARKED STATE
  if (status === 'already_marked') {
    return (
      <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm rounded-2xl border-2 border-black bg-[#150d24] p-6 sm:p-8 shadow-brutal-amber ring-light text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-black bg-retro-pink text-white text-[10px] font-righteous uppercase mb-2">
            MVJCE TALENT'S DAY
          </div>
          <h2 className="text-2xl font-righteous text-white uppercase tracking-wider">
            Already Marked!
          </h2>
          <p className="text-xs text-zinc-300 mt-2 font-mono leading-relaxed">
            Your attendance was already recorded for this Talent's Day session. Enjoy the performances!
          </p>
          <button
            onClick={resetForm}
            className="mt-6 w-full btn-funky bg-retro-yellow text-black py-2.5 text-xs font-righteous"
          >
            RETURN TO SCAN
          </button>
        </div>
      </div>
    );
  }

  // MAIN MVJCE TALENT'S DAY ATTENDANCE TERMINAL
  return (
    <div className="min-h-screen bg-transparent text-zinc-100 px-3.5 sm:px-6 py-5 sm:py-10 flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
      
      {/* Outer Framed Window with Golden Wind Aura */}
      <div className="max-w-[460px] lg:max-w-5xl mx-auto w-full rounded-2xl border-2 border-black bg-[#120c1f]/95 backdrop-blur-md shadow-brutal-amber beam-ring ring-light overflow-hidden flex flex-col relative z-10">
        
        {/* Top Tabbed Navigation Bar */}
        <RetroHeader />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-t-2 border-black">
          
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 p-4 sm:p-8 lg:p-10 flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-[#160e29]">
            
            <div>
              {/* Funky Display Heading */}
              <div className="mb-6 relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-black bg-retro-yellow text-black text-[10px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                    <Zap className="h-3 w-3 fill-black" />
                    MVJCE • TALENT'S DAY 2026
                  </div>
                  <span className="font-righteous text-xs text-retro-pink">
                    OFFICIAL PORTAL
                  </span>
                </div>

                <h1 className="font-righteous text-3xl sm:text-4xl lg:text-5xl tracking-wide text-white drop-shadow-[3px_3px_0px_#000] uppercase text-jojo-gold">
                  TALENT'S DAY ATTENDANCE
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-purple-200 font-mono leading-relaxed">
                  Enter your Student USN/ID and match the auditorium screen's 6-digit PIN.
                </p>
              </div>

              {/* Talent Pass Helper Banner for first-time students */}
              <div className="mb-4 flex items-center justify-between border-2 border-black bg-[#1f1438] px-3 py-2 text-xs font-mono shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-1.5 text-[11px] text-purple-200">
                  <Star className="h-3.5 w-3.5 fill-retro-yellow stroke-black shrink-0" />
                  <span>First time at MVJ Talent's Day?</span>
                </div>
                <NavLink
                  to="/register?key=STATIC_REG_QR_KEY_SECRET_7890"
                  className="font-righteous text-[11px] text-retro-yellow hover:text-white underline underline-offset-2 flex items-center gap-1 shrink-0 uppercase tracking-wider"
                >
                  <span>GET TALENT PASS</span>
                  <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                </NavLink>
              </div>

              {/* Token Status Badge */}
              <div className="mb-5 flex items-center justify-between border-2 border-black bg-[#1f1438] p-3 text-xs font-mono shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${token ? 'bg-retro-green animate-pulse' : 'bg-retro-yellow'}`}></span>
                  <span className="text-zinc-200 font-bold">
                    {token ? `TOKEN: ${token.slice(0, 8)}...` : 'NO TOKEN DETECTED'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="btn-funky bg-retro-pink text-white px-2.5 py-1 text-[11px] font-righteous flex items-center gap-1.5"
                >
                  <Camera className="h-3 w-3" />
                  {token ? 'RE-SCAN' : 'SCAN QR'}
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 border-2 border-black bg-retro-pink/20 text-red-200 p-3 text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-retro-pink" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Field 1: Student ID / USN */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                    <label className="font-bold uppercase tracking-wider text-white">
                      1. STUDENT USN / ID
                    </label>
                    <span className="text-[10px] text-purple-300">
                      USN OR ASSIGNED ID
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="E.G. 1MJ22CS001 OR RAHU3210"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    className="w-full border-2 border-black bg-black px-4 py-3 text-base font-mono font-bold tracking-widest text-white placeholder-zinc-700 shadow-[3px_3px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
                  />
                </div>

                {/* Field 2: Segmented PIN */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                    <label className="font-bold uppercase tracking-wider text-white">
                      2. 6-DIGIT AUDITORIUM PIN
                    </label>
                    <span className="text-[10px] text-retro-yellow font-bold flex items-center gap-1">
                      <Radio className="h-3 w-3 animate-pulse" />
                      19S ROTATION
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2" onPaste={handlePinPaste}>
                    {pinDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (pinInputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onFocus={() => setActivePinIndex(i)}
                        onChange={(e) => handlePinChange(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e.key)}
                        className={`h-11 sm:h-13 w-full border-2 border-black bg-black text-center text-xl sm:text-2xl font-righteous font-bold transition shadow-[2px_2px_0px_#000] ${
                          activePinIndex === i
                            ? 'border-retro-yellow text-retro-yellow shadow-[4px_4px_0px_#fbbf24]'
                            : digit
                            ? 'text-white'
                            : 'text-zinc-700'
                        } focus:outline-none`}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-funky bg-retro-yellow text-black py-4 text-sm font-righteous uppercase tracking-wider hover:bg-yellow-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 stand-glow"
                >
                  {loading ? (
                    <span className="font-mono text-xs font-bold">VERIFYING ATTENDANCE...</span>
                  ) : (
                    <>
                      <span>CONFIRM ATTENDANCE // MVJCE</span>
                      <ArrowRight className="h-4 w-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Geofence Sensor Footer Note */}
            <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between text-[11px] font-mono text-purple-400">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-retro-yellow stroke-black" />
                MVJCE AUDITORIUM GEOFENCE: {coords ? 'LOCKED IN RADIUS' : 'READY'}
              </span>
              <span>CAMPUS AUDITORIUM</span>
            </div>
          </div>

          {/* Right Column (5 cols): MVJ Talent's Day Festive Stage Graphic & Info */}
          <div className="lg:col-span-5 bg-checker-dark bg-checker-sm p-4 sm:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden bg-[#180e2e]">
            
            {/* Top Badges */}
            <div className="w-full flex justify-between items-center">
              <span className="font-righteous text-xs text-retro-yellow">
                ★ MVJCE FESTIVAL
              </span>
              <span className="border-2 border-black bg-retro-purple text-white px-3 py-1 text-[11px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                TALENT'S DAY 2026
              </span>
            </div>

            {/* Funky Festive Stage Art SVG (Microphone, Star, Music Notes, Spotlight) */}
            <div className="my-3 sm:my-5 relative animate-float">
              <svg className="h-28 w-28 sm:h-52 sm:w-52 drop-shadow-[5px_5px_0px_#000]" viewBox="0 0 200 200">
                {/* 8 Flower Petals in MVJCE Festive Royal Purple & Pink */}
                <g fill="#ec4899" stroke="#000" strokeWidth="4">
                  <circle cx="100" cy="35" r="28" />
                  <circle cx="100" cy="165" r="28" />
                  <circle cx="35" cy="100" r="28" />
                  <circle cx="165" cy="100" r="28" />
                  <circle cx="54" cy="54" r="28" />
                  <circle cx="146" cy="146" r="28" />
                  <circle cx="54" cy="146" r="28" />
                  <circle cx="146" cy="54" r="28" />
                </g>
                <circle cx="100" cy="100" r="50" fill="#7e22ce" stroke="#000" strokeWidth="4" />
                {/* Golden Center Stage Star */}
                <circle cx="100" cy="100" r="38" fill="#fbbf24" stroke="#000" strokeWidth="4" />
                
                {/* Stage Spotlight / Music Star */}
                <polygon points="100,72 108,90 128,90 112,102 118,122 100,110 82,122 88,102 72,90 92,90" fill="#000" stroke="#000" strokeWidth="2" />
                <polygon points="100,78 106,92 120,92 109,101 113,116 100,107 87,116 91,101 80,92 94,92" fill="#fbbf24" />
                <circle cx="100" cy="100" r="6" fill="#ec4899" />
              </svg>

              {/* Floating Event dialogue pill */}
              <div className="absolute -top-1 -right-2 border-2 border-black bg-retro-yellow text-black px-2 py-0.5 text-[10px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                「 TALENT'S DAY 」
              </div>
              <div className="absolute -bottom-2 -left-2 border-2 border-black bg-retro-pink text-white px-2 py-0.5 text-[10px] font-righteous uppercase shadow-[2px_2px_0px_#000]">
                『 MVJCE 2026 』
              </div>
            </div>

            {/* Event Description Card */}
            <div className="w-full border-2 border-black bg-[#1f1438] p-4 text-left shadow-[3px_3px_0px_#000] font-mono text-xs">
              <div className="font-righteous text-retro-yellow uppercase text-xs mb-1 flex items-center justify-between">
                <span>MVJ COLLEGE OF ENGINEERING</span>
                <span className="text-retro-pink">LIVE EVENT</span>
              </div>
              <p className="text-purple-200 text-[11px] leading-relaxed">
                "Welcome to MVJCE Talent's Day 2026! Celebrate the music, dance, and dramatic performances. Match the auditorium screen PIN to record your verified attendance."
              </p>
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
            MVJ COLLEGE OF ENGINEERING // OFFICIAL TALENT'S DAY ATTENDANCE
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

      {/* Camera QR Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  QrCode, 
  KeyRound, 
  UserCheck2, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  MapPin, 
  Camera 
} from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';

export default function ScanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [studentId, setStudentId] = useState('');
  const [uniquePin, setUniquePin] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'already_marked' | 'error'
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  // Sync token from URL query params
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Automatically request geolocation in background if available
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setLocationStatus('available');
        },
        () => {
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleScanSuccess = (scannedToken) => {
    setToken(scannedToken);
    setSearchParams({ token: scannedToken });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('No QR token detected. Please scan the dynamic QR code displayed on screen first.');
      return;
    }
    if (!studentId.trim()) {
      setErrorMsg('Please enter your Student ID.');
      return;
    }
    if (!uniquePin.trim()) {
      setErrorMsg('Please enter the 6-digit Unique PIN shown on the screen.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        token: token.trim(),
        student_id: studentId.trim().toUpperCase(),
        unique_pin: uniquePin.trim(),
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
        setErrorMsg(err.response?.data?.error || 'Failed to mark attendance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStatus(null);
    setResultData(null);
    setErrorMsg('');
    setUniquePin('');
  };

  // SUCCESS STATE
  if (status === 'success' && resultData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="h-9 w-9" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Attendance Marked!</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your attendance has been securely verified and logged.
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Student:</span>
              <span className="font-bold text-white">{resultData.student?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Student ID:</span>
              <span className="font-mono font-bold text-emerald-400">{resultData.student?.student_id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Subject:</span>
              <span className="font-bold text-white">{resultData.session?.subject_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Class Hour:</span>
              <span className="font-bold text-brand-300">Hour {resultData.session?.hour_number}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Logged At:</span>
              <span className="text-slate-300">{new Date(resultData.marked_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            Mark for Another Student
          </button>
        </div>
      </div>
    );
  }

  // ALREADY MARKED STATE
  if (status === 'already_marked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-9 w-9" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Already Marked</h2>
          <p className="mt-2 text-sm text-slate-300">
            {resultData?.error || 'Attendance was already submitted for this student in this session.'}
          </p>
          <div className="mt-6 rounded-2xl bg-amber-500/10 p-4 text-xs text-amber-200/80 border border-amber-500/20">
            Double-marking is strictly prevented by database constraints to prevent proxy attendance.
          </div>
          <button
            onClick={resetForm}
            className="mt-6 w-full rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // MAIN ATTENDANCE FORM (StudentID + UniquePIN)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400 ring-1 ring-brand-500/30">
            <UserCheck2 className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
            Mark Classroom Attendance
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Enter your Student ID and the current 6-digit PIN displayed on the screen.
          </p>
        </div>

        {/* Token Status Badge */}
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`h-2.5 w-2.5 rounded-full ${token ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-medium text-slate-300">
              {token ? 'QR Token Linked' : 'No QR Token Detected'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600/30 px-3 py-1.5 text-xs font-semibold text-brand-300 border border-brand-500/30 hover:bg-brand-600/40"
          >
            <Camera className="h-3.5 w-3.5" />
            {token ? 'Rescan' : 'Open Camera'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Student ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                1. Student ID <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCD1234"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-base font-mono uppercase tracking-wider text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <span className="mt-1.5 block text-[11px] text-slate-500">
                First 4 letters of your Name in CAPS + last 4 digits of your Mobile.
              </span>
            </div>

            {/* Field 2: Unique PIN */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                2. Unique PIN <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit PIN from screen"
                  value={uniquePin}
                  onChange={(e) => setUniquePin(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-center text-2xl font-mono font-bold tracking-widest text-brand-300 placeholder-slate-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <span className="mt-1.5 block text-[11px] text-slate-500">
                Rotates every 18-20 seconds on the classroom display.
              </span>
            </div>

            {/* Geolocation indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                GPS Geofence:
              </span>
              <span className={coords ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {coords ? 'Location Acquired' : 'GPS Optional / Standby'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-500 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Verifying & Marking...' : 'Submit Attendance'}
            </button>
          </form>
        </div>
      </div>

      {/* html5-qrcode Camera Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}

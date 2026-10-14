import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  QrCode, 
  ShieldCheck, 
  KeyRound, 
  MapPin, 
  Download, 
  Eye, 
  EyeOff, 
  Copy, 
  Check 
} from 'lucide-react';

export default function AdminSettings() {
  const [regData, setRegData] = useState(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  const token = localStorage.getItem('admin_token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    // Fetch Admin Static Registration QR
    const fetchRegQR = async () => {
      try {
        const res = await axios.get('/api/admin/registration-qr', axiosConfig);
        setRegData(res.data);
      } catch (err) {
        console.error('Failed to load registration QR', err);
      }
    };

    fetchRegQR();
  }, []);

  const handleCopyLink = () => {
    if (regData?.url) {
      navigator.clipboard.writeText(regData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setLoadingPass(true);
    try {
      const res = await axios.post(
        '/api/admin/change-password',
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        axiosConfig
      );
      setPasswordMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System & Security Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access the confidential registration static QR, configure security passkeys, and manage credentials.
          </p>
        </div>

        {/* Section 1: Confidential Static Registration QR */}
        <div className="rounded-3xl border border-brand-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-2 text-brand-400">
            <QrCode className="h-5 w-5" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
              Confidential Static Registration QR Code
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            This QR code contains the secret authorization key needed for student registration. Keep this QR <strong className="text-white">hidden from students</strong> at all times. Print or display it in your faculty room only when enrolling new students.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* QR Image */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="rounded-2xl border-2 border-brand-500/40 bg-white p-3 shadow-xl">
                {regData?.qr_code ? (
                  <img
                    src={regData.qr_code}
                    alt="Confidential Static Registration QR"
                    className="h-52 w-52 rounded-xl object-contain"
                  />
                ) : (
                  <div className="h-52 w-52 flex items-center justify-center text-slate-500 text-xs">
                    Generating Static QR...
                  </div>
                )}
              </div>
              {regData?.qr_code && (
                <a
                  href={regData.qr_code}
                  download="Confidential_Registration_QR.png"
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download High-Res QR (PNG)
                </a>
              )}
            </div>

            {/* URL Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Encoded Registration Secret URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={regData?.url || ''}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-300"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition"
                    title="Copy Link"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Static Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    readOnly
                    value={regData?.key || ''}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-mono text-brand-300"
                  />
                  <button
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="shrink-0 rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/40 p-3 text-[11px] text-slate-400 border border-slate-700/50">
                🔒 Security Note: Anyone visiting <code className="text-white">/register</code> without this exact secret key query parameter will be automatically blocked by the server with a 403 Forbidden.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Change Admin Password */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Change Admin Password</h2>
          </div>

          {passwordMsg && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
              {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPass}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50"
            >
              {loadingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

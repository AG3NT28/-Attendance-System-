import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  QrCode, 
  ShieldCheck, 
  KeyRound, 
  Download, 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  Terminal,
  Lock
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
      setPasswordError(err.response?.data?.error || 'Failed to update credentials');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
            <Terminal className="h-4 w-4" />
            SECURITY ARCHITECTURE // CONFIGURATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-sans">
            System & Security Vault
          </h1>
        </div>

        {/* Section 1: Confidential Static Registration QR */}
        <div className="border border-zinc-800 bg-[#111114] p-6 sm:p-8 bracket-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <QrCode className="h-4 w-4" />
              CONFIDENTIAL REGISTRATION STATIC QR
            </div>
            <span className="text-[10px] text-zinc-500 uppercase">ACCESS_KEY: PROTECTED</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            This physical QR contains the cryptographically signed URL secret required to register new student devices. Display or print this strictly within the authorized instructor office.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* QR Card */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="border border-zinc-700 bg-white p-3 relative shadow-xl">
                {regData?.qr_code ? (
                  <img
                    src={regData.qr_code}
                    alt="Confidential Static Registration QR"
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-zinc-600 text-xs">
                    GENERATING STATIC QR...
                  </div>
                )}
              </div>
              {regData?.qr_code && (
                <a
                  href={regData.qr_code}
                  download="Confidential_Registration_QR.png"
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase"
                >
                  <Download className="h-3.5 w-3.5" />
                  DOWNLOAD QR (PNG)
                </a>
              )}
            </div>

            {/* URL & Key Details */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                  ENCODED REGISTRATION URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={regData?.url || ''}
                    className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 border border-zinc-700 bg-zinc-800 p-2 text-zinc-200 hover:border-amber-400 hover:text-amber-400 transition"
                    title="Copy URL"
                  >
                    {copied ? <Check className="h-4 w-4 text-signal-emerald" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                  REGISTRATION SECRET KEY
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    readOnly
                    value={regData?.key || ''}
                    className="w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-amber-400 font-mono"
                  />
                  <button
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="shrink-0 border border-zinc-700 bg-zinc-800 p-2 text-zinc-200 hover:border-zinc-500"
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="border border-zinc-800 bg-zinc-950/80 p-3 text-[11px] text-zinc-500 leading-relaxed">
                Direct visits to <span className="text-zinc-300 font-bold">/register</span> without this token return 403 Forbidden to block rogue registrations.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Change Admin Password */}
        <div className="border border-zinc-800 bg-[#111114] p-6 sm:p-8 bracket-card shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-zinc-800">
            <Lock className="h-4 w-4 text-amber-400" />
            <span>UPDATE OPERATOR CREDENTIALS</span>
          </div>

          {passwordMsg && (
            <div className="mb-4 border border-signal-emerald/40 bg-signal-emerald/10 p-3 text-xs text-signal-emerald">
              {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 border border-signal-crimson/40 bg-signal-crimson/10 p-3 text-xs text-red-300">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                CURRENT OPERATOR PASSWORD
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                NEW OPERATOR PASSWORD
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                CONFIRM NEW PASSWORD
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPass}
              className="border border-amber-400 bg-amber-400 px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition active:translate-y-[1px] disabled:opacity-50"
            >
              {loadingPass ? 'UPDATING...' : 'COMMIT NEW PASSWORD'}
            </button>
          </form>
        </div>

      </div>
    </AdminLayout>
  );
}

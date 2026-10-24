import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, Terminal, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import RetroHeader from '../../components/RetroHeader';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Authentication rejected. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col justify-between font-sans">
      <RetroHeader />

      <main className="my-auto mx-auto w-full max-w-sm p-4">
        <div className="rounded-2xl border-2 border-black bg-retro-card p-6 sm:p-8 shadow-brutal-amber beam-ring ring-light">
          
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black bg-retro-yellow text-black text-[10px] font-mono font-bold uppercase mb-2 shadow-[2px_2px_0px_#000]">
              <Sparkles className="h-3 w-3 fill-black" />
              AUTHENTICATION GATE
            </div>
            <h1 className="text-3xl font-righteous tracking-wide text-white uppercase drop-shadow-[2px_2px_0px_#000]">
              Admin Login
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Provide operator credentials to initialize attendance.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 border-2 border-black bg-retro-pink/20 text-red-200 p-3 text-xs font-mono shadow-[2px_2px_0px_#000]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                OPERATOR USERNAME
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 border-black bg-black px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                ACCESS PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-black bg-black px-3.5 py-2.5 text-sm text-white placeholder-zinc-700 shadow-[2px_2px_0px_#000] focus:border-retro-yellow focus:outline-none transition"
              />
            </div>

            <div className="border border-black bg-black p-2.5 text-[10px] text-zinc-400">
              DEFAULT: <span className="text-retro-yellow font-bold">admin</span> / <span className="text-retro-yellow font-bold">admin123</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-funky bg-retro-yellow text-black py-3.5 text-xs font-righteous uppercase tracking-wider hover:bg-yellow-300 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>AUTHENTICATE OPERATOR</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-[10px] font-mono text-zinc-600 pb-4">
        JWT SECURE ENCRYPTION // ZERO PASSWORDS STORED IN PLAIN TEXT
      </footer>
    </div>
  );
}

// ─── Detail Pals V2 — Admin Login Page ──────────────────────────────
// Route: /admin/login
// Dark, minimal — does NOT touch or import any cinematic frontend components.

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { signIn, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Force sign out when landing on the login page to clear any existing session
  React.useEffect(() => {
    signOut();
  }, [signOut]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light tracking-[6px] text-white uppercase">
            Detail Pals
          </h1>
          <p className="mt-2 text-xs tracking-[3px] text-white/30 uppercase">
            Admin Panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest text-white/40 uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="admin@detailpals.com"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest text-white/40 uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400/80 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-white text-black font-medium tracking-widest text-sm uppercase py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/20">
          Staff accounts are created by administrators only.
        </p>
      </div>
    </div>
  );
}

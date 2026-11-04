'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Nesprávný e-mail nebo heslo.');
      } else {
        setError(err.message || 'Nepodařilo se přihlásit.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await loginAsDemo();
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError('Nepodařilo se spustit demo přihlášení.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#212A31] text-[#D3D9D4]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#124E66] text-[#D3D9D4] shadow-lg border border-[#748D92]/30 mb-4">
          <CheckSquare className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#D3D9D4]">
          Přihlášení do TaskFlow
        </h2>
        <p className="mt-2 text-sm text-[#748D92]">
          Týmová správa projektů & Vánoční nákupní organizér
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#2E3944] py-8 px-6 shadow-2xl rounded-2xl border border-[#748D92]/30 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                E-mailová adresa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#748D92]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="např. jan.novak@firma.cz"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-[#D3D9D4] placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66] transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                Heslo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#748D92]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-[#D3D9D4] placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66] transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[#D3D9D4] bg-[#124E66] hover:bg-[#124E66]/80 focus:outline-none font-semibold shadow-md transition disabled:opacity-50 text-sm cursor-pointer border border-[#748D92]/30"
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#748D92]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#2E3944] px-3 text-[#748D92] font-semibold tracking-wider">
                  Nebo vyzkoušejte ihned
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading || loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#748D92]/30 rounded-xl text-[#D3D9D4] bg-[#212A31] hover:bg-[#212A31]/80 font-semibold transition text-sm cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {demoLoading ? 'Vytvářím demo účet...' : '1-Click Demo přihlášení'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#748D92]">
            Ještě nemáte účet?{' '}
            <Link href="/register" className="font-semibold text-[#D3D9D4] hover:underline">
              Zaregistrujte se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

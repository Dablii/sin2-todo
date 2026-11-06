'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, LogOut, User as UserIcon, FolderKanban, Gift, CalendarDays } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isProjectsActive = pathname === '/' || pathname.startsWith('/projects');
  const isChristmasActive = pathname === '/christmas';
  const isPlannerActive = pathname === '/planner';

  return (
    <header className="sticky top-0 z-30 bg-[#212A31]/90 backdrop-blur border-b border-[#2E3944]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#D3D9D4] hover:text-white transition">
            <div className="w-9 h-9 rounded-xl bg-[#124E66] text-[#D3D9D4] flex items-center justify-center shadow-md border border-[#748D92]/30">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span>TaskFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                isProjectsActive
                  ? 'bg-[#2E3944] text-[#D3D9D4] border border-[#748D92]/30'
                  : 'text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#2E3944]/50'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-[#124E66]" />
              <span>Projekty</span>
            </Link>

            <Link
              href="/planner"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                isPlannerActive
                  ? 'bg-[#124E66] text-white border border-[#748D92]/40 shadow'
                  : 'text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#2E3944]/50'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>Rozvrh & Plán</span>
            </Link>

            <Link
              href="/christmas"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition relative group ${
                isChristmasActive
                  ? 'bg-[#124E66] text-[#D3D9D4] border border-[#748D92]/40 shadow'
                  : 'text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#2E3944]/50'
              }`}
            >
              <Gift className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>Vánoce</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-rose-900/60 text-rose-300 border border-rose-700/50">
                2026
              </span>
            </Link>
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 bg-[#2E3944] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#748D92]/30">
              <div className="w-7 h-7 rounded-full bg-[#124E66] text-[#D3D9D4] text-xs font-semibold flex items-center justify-center border border-[#748D92]/30">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <span className="text-xs font-medium text-[#D3D9D4] max-w-[130px] truncate hidden sm:inline">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={() => logout()}
              title="Odhlásit se"
              className="p-2 text-[#748D92] hover:text-rose-400 hover:bg-[#2E3944] rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (App style for smartphones) */}
      <nav
        aria-label="Mobilní navigace"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#212A31]/95 backdrop-blur-md border-t border-[#2E3944] px-4 py-2 flex items-center justify-around shadow-2xl safe-area-pb"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition ${
            isProjectsActive ? 'text-white font-bold' : 'text-[#748D92]'
          }`}
        >
          <div className={`p-1 rounded-lg ${isProjectsActive ? 'bg-[#124E66] text-white' : ''}`}>
            <FolderKanban className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Projekty</span>
        </Link>

        <Link
          href="/planner"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition ${
            isPlannerActive ? 'text-emerald-400 font-bold' : 'text-[#748D92]'
          }`}
        >
          <div className={`p-1 rounded-lg ${isPlannerActive ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
            <CalendarDays className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Rozvrh</span>
        </Link>

        <Link
          href="/christmas"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition ${
            isChristmasActive ? 'text-rose-400 font-bold' : 'text-[#748D92]'
          }`}
        >
          <div className={`p-1 rounded-lg ${isChristmasActive ? 'bg-rose-500/20 text-rose-400' : ''}`}>
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Vánoce</span>
        </Link>
      </nav>
    </header>
  );
}

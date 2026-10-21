'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, LogOut, User as UserIcon, FolderKanban } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-indigo-600 hover:text-indigo-700 transition">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span>TaskFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <FolderKanban className="w-4 h-4" />
              Projekty
            </Link>
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={() => logout()}
              title="Odhlásit se"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

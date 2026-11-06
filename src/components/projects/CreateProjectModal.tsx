'use client';

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { createProject } from '@/lib/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCreated: (projectId: string) => void;
}

export function CreateProjectModal({ isOpen, onClose, userId, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const id = await createProject({
        title: title.trim(),
        description: description.trim(),
        ownerId: userId
      });
      setTitle('');
      setDescription('');
      onCreated(id);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Nepodařilo se vytvořit projekt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#2E3944] rounded-t-3xl sm:rounded-2xl max-w-md w-full shadow-2xl border border-[#748D92]/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50">
          <div className="flex items-center gap-2.5 font-bold text-[#D3D9D4]">
            <div className="w-8 h-8 rounded-lg bg-[#124E66] text-[#D3D9D4] flex items-center justify-center border border-[#748D92]/30">
              <FolderPlus className="w-4 h-4" />
            </div>
            <span>Nový projekt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Název projektu *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. Vánoční večírek, Redesign webu..."
              className="w-full px-3.5 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-sm text-[#D3D9D4] placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Popis projektu (volitelný)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krátký popis cílů nebo harmonogramu..."
              className="w-full px-3.5 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-sm text-[#D3D9D4] placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66] transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#748D92]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-xl transition"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2.5 bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] rounded-xl font-semibold text-xs shadow-md transition disabled:opacity-50 border border-[#748D92]/30"
            >
              {loading ? 'Vytvářím...' : 'Vytvořit projekt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

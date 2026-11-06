'use client';

import React, { useState } from 'react';
import { X, Layers, Plus, Trash2 } from 'lucide-react';
import { Section } from '@/types';
import { createSection, deleteSection } from '@/lib/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  sections: Section[];
}

export function SectionModal({ isOpen, onClose, projectId, sections }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      await createSection(projectId, newTitle.trim(), sections.length);
      setNewTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Opravdu chcete smazat tuto sekci? Úkoly v ní zůstanou, ale sekce jim bude odebrána.')) return;
    try {
      await deleteSection(sectionId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#2E3944] rounded-t-3xl sm:rounded-2xl max-w-md w-full shadow-2xl border border-[#748D92]/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50">
          <div className="flex items-center gap-2.5 font-bold text-[#D3D9D4]">
            <div className="w-8 h-8 rounded-lg bg-[#124E66] text-[#D3D9D4] flex items-center justify-center border border-[#748D92]/30">
              <Layers className="w-4 h-4" />
            </div>
            <span>Správa sekcí</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nová sekce (Marketing, IT, Finance)..."
              className="flex-1 px-3.5 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-xs text-[#D3D9D4] placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66] transition"
            />
            <button
              type="submit"
              disabled={loading || !newTitle.trim()}
              className="px-4 py-2.5 bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer border border-[#748D92]/30"
            >
              <Plus className="w-4 h-4" />
              Přidat
            </button>
          </form>

          <div>
            <h4 className="text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-3">
              Existující sekce ({sections.length})
            </h4>

            {sections.length === 0 ? (
              <p className="text-xs text-[#748D92] italic">
                Zatím jste nevytvořili žádnou sekci. Sekce slouží k rozdělení úkolů podle týmu či tématu.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {sections.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#212A31] border border-[#748D92]/20"
                  >
                    <span className="text-xs font-semibold text-[#D3D9D4]">
                      {s.title}
                    </span>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-[#748D92] hover:text-rose-400 rounded-lg transition"
                      title="Smazat sekci"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#748D92]/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#212A31] hover:bg-[#212A31]/80 text-[#D3D9D4] rounded-xl text-xs font-semibold border border-[#748D92]/30 transition"
            >
              Hotovo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span>Správa tematických sekcí</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
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
              placeholder="Nová sekce (např. Marketing, IT, Finance)..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <button
              type="submit"
              disabled={loading || !newTitle.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Přidat
            </button>
          </form>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Existující sekce projektu ({sections.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              {sections.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">
                  Zatím žádné sekce. Přidejte první výše.
                </div>
              ) : (
                sections.map((sec) => (
                  <div key={sec.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                    <span className="text-sm font-medium text-slate-800">{sec.title}</span>
                    <button
                      onClick={() => handleDelete(sec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Smazat sekci"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ChristmasRecipient } from '@/types';
import { X, UserPlus, Heart, Wallet, Users } from 'lucide-react';

interface RecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; relationship?: string; budgetLimit?: number }) => Promise<void>;
  initialData?: ChristmasRecipient | null;
}

const PRESET_RELATIONSHIPS = [
  'Máma',
  'Táta',
  'Partner / Partnerka',
  'Syn / Dcera',
  'Babička / Dědeček',
  'Sourozenec',
  'Kamarád / Kamarádka',
  'Kolega / Kolegyně',
  'Ostatní',
];

export function RecipientModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: RecipientModalProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setRelationship(initialData.relationship || '');
      setBudgetLimit(initialData.budgetLimit ? String(initialData.budgetLimit) : '');
    } else {
      setName('');
      setRelationship('Rodina');
      setBudgetLimit('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        relationship: relationship.trim(),
        budgetLimit: budgetLimit ? parseInt(budgetLimit, 10) || 0 : 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#2E3944] w-full max-w-md rounded-2xl border border-[#748D92]/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#124E66] text-[#D3D9D4] flex items-center justify-center border border-[#748D92]/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#D3D9D4]">
              {initialData ? 'Upravit osobu' : 'Přidat osobu do seznamu'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Jméno / Přezdívka *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Např. Máma, Honza, Babička..."
              className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Vztah / Kategorie
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_RELATIONSHIPS.map((rel) => (
                <button
                  type="button"
                  key={rel}
                  onClick={() => setRelationship(rel)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    relationship === rel
                      ? 'bg-[#124E66] border-[#124E66] text-[#D3D9D4]'
                      : 'bg-[#212A31] border-[#748D92]/30 text-[#748D92] hover:text-[#D3D9D4]'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Vlastní vztah nebo kategorie..."
              className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2 text-xs text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Cílový rozpočet pro tuto osobu (volitelné)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder="Např. 1500"
                className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-[#748D92]">
                Kč
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#748D92]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] transition"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-sm font-semibold transition shadow-md disabled:opacity-50 border border-[#748D92]/30"
            >
              {isSubmitting ? 'Ukládám...' : initialData ? 'Uložit změny' : 'Přidat osobu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

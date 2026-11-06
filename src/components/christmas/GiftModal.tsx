'use client';

import React, { useState, useEffect } from 'react';
import { GiftIdea, GiftStatus } from '@/types';
import { X, Sparkles, Loader2, ExternalLink, Tag, DollarSign, FileText } from 'lucide-react';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<GiftIdea, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: GiftIdea | null;
  recipientName: string;
}

const STATUS_OPTIONS: { value: GiftStatus; label: string; icon: string; color: string }[] = [
  { value: 'IDEA', label: '💡 Nápad', icon: '💡', color: 'text-amber-400' },
  { value: 'PURCHASED', label: '🛒 Koupeno / Objednáno', icon: '🛒', color: 'text-sky-400' },
  { value: 'WRAPPED', label: '🎁 Zabaleno', icon: '🎁', color: 'text-indigo-400' },
  { value: 'DELIVERED', label: '✨ Předáno', icon: '✨', color: 'text-emerald-400' },
];

export function GiftModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  recipientName,
}: GiftModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState<string>('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<GiftStatus>('IDEA');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setUrl(initialData.url || '');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setNote(initialData.note || '');
      setStatus(initialData.status || 'IDEA');
    } else {
      setTitle('');
      setUrl('');
      setPrice('');
      setNote('');
      setStatus('IDEA');
    }
    setFetchError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setFetchError('Nejprve vložte odkaz (URL) na produkt.');
      return;
    }

    setIsFetchingUrl(true);
    setFetchError(null);

    try {
      const res = await fetch('/api/fetch-product-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst data z URL');
      }

      if (data.title && !title) {
        setTitle(data.title);
      }
      if (data.price !== null && data.price !== undefined) {
        setPrice(String(data.price));
      }
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Chyba při čtení webu. Cenu a název můžete zapsat manuálně.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        price: price ? parseInt(price, 10) || 0 : 0,
        note: note.trim(),
        status,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#2E3944] w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-[#748D92]/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#D3D9D4]">
              {initialData ? 'Upravit dárek' : 'Přidat nový dárek'}
            </h2>
            <p className="text-xs text-[#748D92]">
              Pro: <span className="font-semibold text-[#D3D9D4]">{recipientName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Smart URL Import */}
          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Odkaz na e-shop (volitelné)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.alza.cz/kod/..."
                className="flex-1 bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
              />
              <button
                type="button"
                onClick={handleFetchMetadata}
                disabled={isFetchingUrl || !url.trim()}
                title="Automaticky načte název a cenu z e-shopu"
                className="px-3.5 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border border-[#748D92]/30"
              >
                {isFetchingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>Načíst cenu</span>
              </button>
            </div>
            {fetchError && (
              <p className="mt-1 text-xs text-rose-400">{fetchError}</p>
            )}
          </div>

          {/* Gift Title */}
          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Název dárku *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. Teplý vlněný svetr, Kniha sci-fi..."
              className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
            />
          </div>

          {/* Price & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                Cena (CZK / Kč)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition font-mono"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-[#748D92]">
                  Kč
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                Stav dárku
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GiftStatus)}
                className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] focus:outline-none focus:border-[#124E66] transition cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#2E3944] text-[#D3D9D4]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Details */}
          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
              Poznámka (velikost, barva, tajné místo úkrytu...)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Např. Velikost M, modrá barva, schováno ve skříni..."
              className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition resize-none"
            />
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
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-sm font-semibold transition shadow-md disabled:opacity-50 border border-[#748D92]/30"
            >
              {isSubmitting ? 'Ukládám...' : initialData ? 'Uložit změny' : 'Přidat dárek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

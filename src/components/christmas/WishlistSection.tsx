'use client';

import React, { useState } from 'react';
import { WishlistItem, Priority } from '@/types';
import {
  Gift,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Loader2,
  X
} from 'lucide-react';

interface WishlistSectionProps {
  items: WishlistItem[];
  onAddItem: (data: {
    title: string;
    url?: string;
    estimatedPrice?: number;
    note?: string;
    priority: Priority;
  }) => Promise<void>;
  onUpdateItem: (id: string, data: Partial<WishlistItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export function WishlistSection({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: WishlistSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setUrl('');
    setEstimatedPrice('');
    setNote('');
    setPriority('MEDIUM');
    setIsModalOpen(true);
  };

  const openEditModal = (item: WishlistItem) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setUrl(item.url || '');
    setEstimatedPrice(item.estimatedPrice ? String(item.estimatedPrice) : '');
    setNote(item.note || '');
    setPriority(item.priority || 'MEDIUM');
    setIsModalOpen(true);
  };

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/fetch-product-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.title && !title) setTitle(data.title);
        if (data.price !== null && data.price !== undefined) setEstimatedPrice(String(data.price));
      }
    } catch {
      // silently ignore or allow manual
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await onUpdateItem(editingItem.id, {
          title: title.trim(),
          url: url.trim(),
          estimatedPrice: estimatedPrice ? parseInt(estimatedPrice, 10) || 0 : 0,
          note: note.trim(),
          priority,
        });
      } else {
        await onAddItem({
          title: title.trim(),
          url: url.trim(),
          estimatedPrice: estimatedPrice ? parseInt(estimatedPrice, 10) || 0 : 0,
          note: note.trim(),
          priority,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyWishlist = async () => {
    if (items.length === 0) return;

    const lines = [
      '🎄 Můj vánoční wishlist přání:',
      '',
      ...items.map((item, idx) => {
        const priceStr = item.estimatedPrice ? ` (~${item.estimatedPrice.toLocaleString('cs-CZ')} Kč)` : '';
        const urlStr = item.url ? ` - ${item.url}` : '';
        const noteStr = item.note ? ` [${item.note}]` : '';
        return `${idx + 1}. ${item.title}${priceStr}${urlStr}${noteStr}`;
      }),
      '',
      'Děkuji Ježíšku! ✨',
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#2E3944] p-5 rounded-2xl border border-[#748D92]/30 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-[#D3D9D4] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            Můj osobní wishlist
          </h2>
          <p className="text-xs text-[#748D92] mt-1">
            Seznam věcí, které by vám udělaly radost pod stromečkem. Uložen soukromě pro váš účet.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyWishlist}
            disabled={items.length === 0}
            className="px-4 py-2 rounded-xl bg-[#212A31] hover:bg-[#212A31]/80 text-[#D3D9D4] text-xs font-semibold flex items-center gap-1.5 transition border border-[#748D92]/30 disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Zkopírováno do schránky!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#748D92]" />
                <span>Kopírovat pro rodinu</span>
              </>
            )}
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs font-semibold flex items-center gap-1.5 transition border border-[#748D92]/30 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat přání</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#2E3944]/50 border border-dashed border-[#748D92]/30">
          <Gift className="w-10 h-10 text-[#748D92] mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-semibold text-[#D3D9D4]">Váš wishlist je zatím prázdný</h3>
          <p className="text-xs text-[#748D92] mt-1 max-w-sm mx-auto">
            Napište si svá tajná i veřejná přání pro Ježíška, vložte odkaz nebo cenu.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#124E66] text-[#D3D9D4] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#124E66]/80 transition border border-[#748D92]/30 shadow"
          >
            <Plus className="w-4 h-4" />
            Přidat první položku
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-[#2E3944] border transition flex flex-col justify-between ${
                item.isCompleted
                  ? 'border-emerald-800/40 opacity-70 bg-[#2E3944]/60'
                  : 'border-[#748D92]/30 hover:border-[#748D92]/60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button
                    onClick={() => onUpdateItem(item.id, { isCompleted: !item.isCompleted })}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                    title={item.isCompleted ? 'Označit jako nesplněné' : 'Označit jako splněné'}
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-[#748D92] hover:text-[#D3D9D4] shrink-0" />
                    )}
                    <span
                      className={`text-sm font-semibold text-[#D3D9D4] leading-snug truncate ${
                        item.isCompleted ? 'line-through text-[#748D92]' : ''
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 text-[#748D92] hover:text-[#D3D9D4] rounded transition"
                      title="Upravit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-[#748D92] hover:text-rose-400 rounded transition"
                      title="Smazat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.note && (
                  <p className="text-xs text-[#748D92] mb-3 ml-7">{item.note}</p>
                )}
              </div>

              <div className="pt-2 border-t border-[#748D92]/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        : item.priority === 'LOW'
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-[#124E66]/50 text-[#D3D9D4] border border-[#124E66]'
                    }`}
                  >
                    {item.priority === 'HIGH' ? 'Musím mít' : item.priority === 'LOW' ? 'Kdyby zbylo' : 'Přeji si'}
                  </span>
                  {item.estimatedPrice ? (
                    <span className="font-mono font-bold text-[#D3D9D4]">
                      ~{item.estimatedPrice.toLocaleString('cs-CZ')} Kč
                    </span>
                  ) : null}
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#748D92] hover:text-sky-300 flex items-center gap-1 transition"
                  >
                    <span>Odkaz</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#2E3944] w-full max-w-md rounded-2xl border border-[#748D92]/40 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50">
              <h2 className="text-lg font-bold text-[#D3D9D4]">
                {editingItem ? 'Upravit přání' : 'Přidat přání do wishlistu'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                  Odkaz na e-shop (volitelné)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2 text-xs text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={isFetchingUrl || !url.trim()}
                    className="px-3 py-2 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 shrink-0 border border-[#748D92]/30"
                  >
                    {isFetchingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Načíst</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                  Co si přeji? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Sluchátka Sony WH-1000XM5, Kávovar..."
                  className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                    Orientační cena (Kč)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] font-mono focus:outline-none focus:border-[#124E66] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                    Priorita
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#D3D9D4] focus:outline-none focus:border-[#124E66] transition"
                  >
                    <option value="HIGH">🔥 Musím mít</option>
                    <option value="MEDIUM">⭐ Přeji si</option>
                    <option value="LOW">💡 Kdyby zbylo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-1.5">
                  Poznámka (barva, specifikace, velikost)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Černá barva, evropská distribuce..."
                  className="w-full bg-[#212A31] border border-[#748D92]/40 rounded-xl px-3.5 py-2 text-xs text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#748D92]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#748D92] hover:text-[#D3D9D4]"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-5 py-2 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs font-semibold transition border border-[#748D92]/30 shadow"
                >
                  {isSubmitting ? 'Ukládám...' : editingItem ? 'Uložit' : 'Přidat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

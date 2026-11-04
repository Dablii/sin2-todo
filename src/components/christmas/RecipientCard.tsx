'use client';

import React from 'react';
import { ChristmasRecipient, GiftIdea, GiftStatus } from '@/types';
import {
  Gift,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  Sparkles,
  Lightbulb,
  Check,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface RecipientCardProps {
  recipient: ChristmasRecipient;
  privacyMode: boolean;
  onAddGift: () => void;
  onEditRecipient: () => void;
  onDeleteRecipient: () => void;
  onEditGift: (gift: GiftIdea) => void;
  onDeleteGift: (giftId: string) => void;
  onUpdateGiftStatus: (giftId: string, nextStatus: GiftStatus) => void;
}

const STATUS_CONFIG: Record<
  GiftStatus,
  { label: string; bg: string; text: string; border: string; next: GiftStatus; icon: any }
> = {
  IDEA: {
    label: 'Nápad',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
    next: 'PURCHASED',
    icon: Lightbulb,
  },
  PURCHASED: {
    label: 'Koupeno',
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    border: 'border-sky-700/50',
    next: 'WRAPPED',
    icon: Check,
  },
  WRAPPED: {
    label: 'Zabaleno',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-300',
    border: 'border-indigo-700/50',
    next: 'DELIVERED',
    icon: Package,
  },
  DELIVERED: {
    label: 'Předáno',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-700/50',
    next: 'IDEA',
    icon: Sparkles,
  },
};

export function RecipientCard({
  recipient,
  privacyMode,
  onAddGift,
  onEditRecipient,
  onDeleteRecipient,
  onEditGift,
  onDeleteGift,
  onUpdateGiftStatus,
}: RecipientCardProps) {
  const gifts = recipient.gifts || [];

  const totalSpent = gifts
    .filter((g) => ['PURCHASED', 'WRAPPED', 'DELIVERED'].includes(g.status))
    .reduce((sum, g) => sum + (g.price || 0), 0);

  const budget = recipient.budgetLimit || 0;
  const isOverBudget = budget > 0 && totalSpent > budget;

  const deliveredCount = gifts.filter((g) => g.status === 'DELIVERED').length;
  const readyCount = gifts.filter((g) => ['PURCHASED', 'WRAPPED', 'DELIVERED'].includes(g.status)).length;

  const formatPrice = (val: number) => {
    if (privacyMode) return '•••• Kč';
    return `${val.toLocaleString('cs-CZ')} Kč`;
  };

  return (
    <div className="bg-[#2E3944] rounded-2xl border border-[#748D92]/30 shadow-md flex flex-col justify-between overflow-hidden transition-all hover:border-[#748D92]/60">
      {/* Header */}
      <div className="p-5 border-b border-[#748D92]/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#D3D9D4] tracking-tight">
                {recipient.name}
              </h3>
              {recipient.relationship && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#124E66]/50 text-[#D3D9D4] border border-[#124E66]">
                  {recipient.relationship}
                </span>
              )}
            </div>

            {/* Budget status info */}
            <div className="mt-2 flex items-baseline gap-2 text-xs">
              <span className="text-[#748D92]">Utraceno:</span>
              <span className="font-bold text-[#D3D9D4]">{formatPrice(totalSpent)}</span>
              {budget > 0 && (
                <>
                  <span className="text-[#748D92]">/ cíl:</span>
                  <span className="text-[#748D92]">{formatPrice(budget)}</span>
                  {isOverBudget && (
                    <span className="text-[10px] text-rose-400 font-semibold">
                      (+{formatPrice(totalSpent - budget)})
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onEditRecipient}
              title="Upravit osobu"
              className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDeleteRecipient}
              title="Smazat osobu"
              className="p-1.5 text-[#748D92] hover:text-rose-400 hover:bg-[#212A31] rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget Progress Bar */}
        {budget > 0 && (
          <div className="mt-3 w-full bg-[#212A31] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOverBudget ? 'bg-rose-500' : 'bg-[#124E66]'
              }`}
              style={{
                width: `${Math.min((totalSpent / budget) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Gifts List */}
      <div className="p-5 flex-1 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#748D92] font-semibold mb-2">
          <span>Dárky ({gifts.length})</span>
          <span>
            Připraveno: {readyCount} / {gifts.length}
          </span>
        </div>

        {gifts.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl bg-[#212A31]/50 border border-dashed border-[#748D92]/30">
            <Gift className="w-7 h-7 text-[#748D92] mx-auto mb-1.5 opacity-60" />
            <p className="text-xs text-[#748D92]">Zatím žádné nápady ani dárky.</p>
            <button
              onClick={onAddGift}
              className="mt-2 text-xs font-semibold text-[#D3D9D4] hover:text-white inline-flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Přidat první dárek
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {gifts.map((gift) => {
              const statusCfg = STATUS_CONFIG[gift.status];
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={gift.id}
                  className="group p-3 rounded-xl bg-[#212A31] border border-[#748D92]/20 hover:border-[#748D92]/50 transition flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#D3D9D4] truncate">
                          {privacyMode ? '••••••••••' : gift.title}
                        </span>
                        {gift.url && (
                          <a
                            href={gift.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Otevřít odkaz na e-shop"
                            className="text-[#748D92] hover:text-sky-300 transition shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {gift.note && !privacyMode && (
                        <p className="text-[11px] text-[#748D92] line-clamp-1 mt-0.5">
                          {gift.note}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-[#D3D9D4]">
                        {gift.price ? formatPrice(gift.price) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Status clicker & Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#748D92]/10">
                    {/* Status pill button: clicking advances to next status */}
                    <button
                      type="button"
                      onClick={() => onUpdateGiftStatus(gift.id, statusCfg.next)}
                      title={`Kliknutím přepnete na: ${STATUS_CONFIG[statusCfg.next].label}`}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-pointer ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} hover:opacity-90`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusCfg.label}</span>
                      <ChevronRight className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </button>

                    {/* Gift Item Edit / Delete */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditGift(gift)}
                        title="Upravit dárek"
                        className="p-1 text-[#748D92] hover:text-[#D3D9D4] rounded transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGift(gift.id)}
                        title="Smazat dárek"
                        className="p-1 text-[#748D92] hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Quick Add Gift */}
      <div className="p-4 bg-[#212A31]/40 border-t border-[#748D92]/20">
        <button
          onClick={onAddGift}
          className="w-full py-2 px-3 rounded-xl bg-[#124E66]/60 hover:bg-[#124E66] text-[#D3D9D4] text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-[#748D92]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Přidat dárek pro {recipient.name}</span>
        </button>
      </div>
    </div>
  );
}

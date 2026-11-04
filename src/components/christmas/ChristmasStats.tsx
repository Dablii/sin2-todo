'use client';

import React, { useState, useEffect } from 'react';
import { ChristmasRecipient } from '@/types';
import {
  Clock,
  Wallet,
  Gift,
  CheckCircle2,
  Package,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface ChristmasStatsProps {
  recipients: ChristmasRecipient[];
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}

export function ChristmasStats({ recipients, privacyMode, onTogglePrivacy }: ChristmasStatsProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      let targetDate = new Date(targetYear, 11, 24, 18, 0, 0); // 24. prosince 18:00

      if (now.getTime() > targetDate.getTime()) {
        // If past this year's Christmas, count to next year
        targetYear += 1;
        targetDate = new Date(targetYear, 11, 24, 18, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // Aggregations
  const totalBudget = recipients.reduce((sum, r) => sum + (r.budgetLimit || 0), 0);
  const allGifts = recipients.flatMap((r) => r.gifts || []);

  const totalSpent = allGifts
    .filter((g) => ['PURCHASED', 'WRAPPED', 'DELIVERED'].includes(g.status))
    .reduce((sum, g) => sum + (g.price || 0), 0);

  const totalEstimated = allGifts.reduce((sum, g) => sum + (g.price || 0), 0);

  const ideaCount = allGifts.filter((g) => g.status === 'IDEA').length;
  const purchasedCount = allGifts.filter((g) => g.status === 'PURCHASED').length;
  const wrappedCount = allGifts.filter((g) => g.status === 'WRAPPED').length;
  const deliveredCount = allGifts.filter((g) => g.status === 'DELIVERED').length;
  const completedGifts = purchasedCount + wrappedCount + deliveredCount;
  const totalGiftsCount = allGifts.length;
  const progressPercent = totalGiftsCount > 0 ? Math.round((completedGifts / totalGiftsCount) * 100) : 0;

  const formatPrice = (val: number) => {
    if (privacyMode) return '•••• Kč';
    return `${val.toLocaleString('cs-CZ')} Kč`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Countdown & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Countdown card */}
        <div className="bg-[#2E3944] rounded-2xl p-5 border border-[#748D92]/30 shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#748D92] uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#124E66]" />
              <span>Odpočet do Štědrého dne</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2 text-[#D3D9D4]">
              {timeLeft.isPast ? (
                <span className="text-xl font-bold text-emerald-400">Šťastné a veselé Vánoce! 🎄</span>
              ) : (
                <>
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold">{timeLeft.days}</span>
                    <span className="text-[10px] block text-[#748D92]">dní</span>
                  </div>
                  <span className="text-xl text-[#748D92]">:</span>
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] block text-[#748D92]">hod</span>
                  </div>
                  <span className="text-xl text-[#748D92]">:</span>
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] block text-[#748D92]">min</span>
                  </div>
                  <span className="text-xl text-[#748D92]">:</span>
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#748D92]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] block text-[#748D92]">sek</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onTogglePrivacy}
            title={privacyMode ? 'Zobrazit ceny a detaily' : 'Skrýt ceny před zvědavci (Privacy Mode)'}
            className={`p-3 rounded-xl border transition flex flex-col items-center gap-1 text-xs ${
              privacyMode
                ? 'bg-[#124E66] border-[#124E66] text-white shadow'
                : 'bg-[#212A31] border-[#748D92]/30 text-[#748D92] hover:text-[#D3D9D4] hover:border-[#748D92]'
            }`}
          >
            {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{privacyMode ? 'Skryto' : 'Privacy'}</span>
          </button>
        </div>

        {/* Budget overview card */}
        <div className="bg-[#2E3944] rounded-2xl p-5 border border-[#748D92]/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#748D92] uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#124E66]" />
              Rozpočet dárků
            </span>
            <span className="text-xs text-[#748D92]">
              Limit: <strong className="text-[#D3D9D4]">{formatPrice(totalBudget)}</strong>
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#D3D9D4]">
                {formatPrice(totalSpent)}
              </span>
              <span className="text-xs text-[#748D92] ml-2">utraceno</span>
            </div>
            {totalBudget > 0 && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                totalSpent > totalBudget ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-[#124E66]/40 text-[#D3D9D4] border border-[#124E66]'
              }`}>
                {totalSpent > totalBudget
                  ? `Překročeno o ${formatPrice(totalSpent - totalBudget)}`
                  : `Zbývá ${formatPrice(totalBudget - totalSpent)}`}
              </span>
            )}
          </div>

          {/* Budget progress bar */}
          <div className="mt-3 w-full bg-[#212A31] rounded-full h-2 overflow-hidden border border-[#748D92]/20">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                totalSpent > totalBudget && totalBudget > 0 ? 'bg-rose-500' : 'bg-[#124E66]'
              }`}
              style={{
                width: totalBudget > 0 ? `${Math.min((totalSpent / totalBudget) * 100, 100)}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Gift checklist & completion status */}
        <div className="bg-[#2E3944] rounded-2xl p-5 border border-[#748D92]/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#748D92] uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#124E66]" />
                Postup nákupů
              </span>
              <span className="text-[#D3D9D4] font-bold">{progressPercent}%</span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#212A31] border border-[#748D92]/20">
                <span className="block font-bold text-amber-400 text-base">{ideaCount}</span>
                <span className="text-[10px] text-[#748D92]">Nápady</span>
              </div>
              <div className="p-2 rounded-xl bg-[#212A31] border border-[#748D92]/20">
                <span className="block font-bold text-sky-400 text-base">{purchasedCount}</span>
                <span className="text-[10px] text-[#748D92]">Koupeno</span>
              </div>
              <div className="p-2 rounded-xl bg-[#212A31] border border-[#748D92]/20">
                <span className="block font-bold text-indigo-400 text-base">{wrappedCount}</span>
                <span className="text-[10px] text-[#748D92]">Zabaleno</span>
              </div>
              <div className="p-2 rounded-xl bg-[#212A31] border border-[#748D92]/20">
                <span className="block font-bold text-emerald-400 text-base">{deliveredCount}</span>
                <span className="text-[10px] text-[#748D92]">Předáno</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

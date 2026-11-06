'use client';

import React, { useState } from 'react';
import { ScheduleEvent, EventCategory } from '@/types';
import { CATEGORY_CONFIG, MONTH_NAMES, CZECH_DAYS } from './plannerConstants';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Award } from 'lucide-react';

interface MonthlyViewProps {
  events: ScheduleEvent[];
  selectedCategory: string;
  onSelectDate: (dateStr: string) => void;
  onEditEvent: (event: ScheduleEvent) => void;
}

export function MonthlyView({
  events,
  selectedCategory,
  onSelectDate,
  onEditEvent
}: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // První a poslední den měsíce
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Den v týdnu pro první den (1=Po, ... 7=Ne)
  const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

  // Posun měsíců
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const resetToToday = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtrované události
  const filteredEvents = events.filter(e => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    return true;
  });

  // Buňky kalendáře
  const days = [];
  // Prázdné buňky před 1. dnem
  for (let i = 1; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  // Dny v měsíci
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="bg-[#212A31] border border-[#2E3944] rounded-2xl overflow-hidden shadow-xl">
      {/* Header měsíce */}
      <div className="p-4 sm:px-6 border-b border-[#2E3944] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={resetToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2E3944] hover:bg-[#124E66] text-[#D3D9D4] hover:text-white transition"
          >
            Dnes
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl text-[#748D92] hover:text-white hover:bg-[#2E3944] transition"
            title="Předchozí měsíc"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl text-[#748D92] hover:text-white hover:bg-[#2E3944] transition"
            title="Další měsíc"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dny v týdnu (Po - Ne) */}
      <div className="grid grid-cols-7 border-b border-[#2E3944] bg-[#2E3944]/30 text-center text-xs font-semibold text-[#748D92] py-2.5">
        {CZECH_DAYS.map(d => (
          <div key={d.id}>{d.short}</div>
        ))}
      </div>

      {/* Mřížka dnů s podporou horizontálního posunu na velmi malých displejích */}
      <div className="overflow-x-auto">
        <div className="min-w-[340px]">
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#2E3944]/40 bg-[#212A31]">
            {days.map((dayNum, idx) => {
              if (!dayNum) {
                return (
                  <div key={`empty-${idx}`} className="min-h-[75px] sm:min-h-[105px] p-1 bg-[#212A31]/20 opacity-30" />
                );
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;

              // Vypočítat den v týdnu pro tento konkrétní den (1=Po, ... 7=Ne)
              const cellDate = new Date(year, month, dayNum);
              const jsDay = cellDate.getDay();
              const czechDayId = jsDay === 0 ? 7 : jsDay;

              // Vyhledat události pro tento den
              const dayEvents = filteredEvents.filter(e => {
                if (e.recurrence === 'NONE' && e.date === dateStr) return true;
                if (e.recurrence === 'DAILY') return true;
                if (e.recurrence === 'WEEKLY' && e.daysOfWeek && e.daysOfWeek.includes(czechDayId)) return true;
                return false;
              });

              const isWeekend = czechDayId === 6 || czechDayId === 7;

              return (
                <div
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className={`min-h-[75px] sm:min-h-[105px] p-1 sm:p-2 flex flex-col justify-between group hover:bg-[#2E3944]/40 transition cursor-pointer ${
                    isWeekend ? 'bg-[#212A31]/50' : ''
                  } ${isToday ? 'ring-1 ring-inset ring-[#124E66]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'text-[#D3D9D4]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#748D92] hover:text-white transition"
                      title="Přidat událost"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Události v buňce */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {/* Na malých mobilech zobrazit barevné tečky pro úsporu místa, na větších celý badge */}
                    <div className="flex sm:hidden flex-wrap gap-1 items-center py-1">
                      {dayEvents.slice(0, 3).map(evt => {
                        const isExam = evt.category === 'EXAM';
                        const isSport = evt.category === 'SPORT';
                        return (
                          <span
                            key={evt.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isExam ? 'bg-rose-400' : isSport ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-[#748D92]">+{dayEvents.length - 3}</span>
                      )}
                    </div>

                    <div className="hidden sm:block space-y-1">
                      {dayEvents.slice(0, 3).map(evt => {
                        const cat = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.STUDY;
                        const isExam = evt.category === 'EXAM';

                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEvent(evt);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 border ${
                              isExam
                                ? 'bg-rose-950/80 border-rose-700/60 text-rose-200'
                                : `${cat.bg} ${cat.border} ${cat.text}`
                            }`}
                            title={`${evt.title} (${evt.startTime}-${evt.endTime})`}
                          >
                            {isExam && <Award className="w-2.5 h-2.5 text-rose-300 shrink-0" />}
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-[#748D92] font-semibold pl-1">
                          +{dayEvents.length - 3} další
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

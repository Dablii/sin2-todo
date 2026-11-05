'use client';

import React from 'react';
import { ScheduleEvent, EventCategory } from '@/types';
import { CATEGORY_CONFIG, MONTH_NAMES } from './plannerConstants';
import { Calendar, Clock, Award, CheckCircle, ChevronRight, Plus, Flag } from 'lucide-react';

interface LongTermRoadmapProps {
  events: ScheduleEvent[];
  onAddExam: () => void;
  onEditEvent: (event: ScheduleEvent) => void;
}

export function LongTermRoadmap({
  events,
  onAddExam,
  onEditEvent
}: LongTermRoadmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Získat všechny události s konkrétním budoucím datem
  const futureDateEvents = events
    .filter(e => e.date && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  // Klíčové zkoušky / milníky (kategorie EXAM)
  const exams = futureDateEvents.filter(e => e.category === 'EXAM');

  // Skupiny podle měsíců do budoucna
  const monthsMap = new Map<string, ScheduleEvent[]>();
  futureDateEvents.forEach(e => {
    const d = new Date(e.date!);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, []);
    }
    monthsMap.get(monthKey)!.push(e);
  });

  return (
    <div className="space-y-6">
      {/* 1. Odpočet do zkoušek a velkých cílů */}
      <div className="bg-[#212A31] border border-[#2E3944] rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Klíčové zkoušky & Odpočet</h2>
              <p className="text-xs text-[#748D92]">Blížící se termíny zkoušek, SCIO testů a maturity</p>
            </div>
          </div>

          <button
            onClick={onAddExam}
            className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Přidat termín zkoušky</span>
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[#2E3944] text-center text-xs text-[#748D92]">
            Zatím nemáš zadanou žádnou budoucí zkoušku (SCIO, maturita, test).
            <button
              onClick={onAddExam}
              className="block mx-auto mt-2 text-rose-400 hover:underline font-semibold"
            >
              + Zadat první termín
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {exams.map(exam => {
              const examDate = new Date(exam.date!);
              const diffTime = examDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={exam.id}
                  onClick={() => onEditEvent(exam)}
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-700/40 hover:border-rose-500/60 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Flag className="w-3.5 h-3.5 text-rose-400" />
                        Zkouška
                      </span>
                      <span className="font-mono text-[11px] text-[#748D92]">{exam.date}</span>
                    </div>
                    <h3 className="font-bold text-white text-sm group-hover:text-rose-200 transition">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-xs text-[#748D92] line-clamp-2 mt-1">{exam.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-rose-900/40 flex items-center justify-between text-xs">
                    <span className="text-[#748D92] font-medium">Zbývá:</span>
                    <span
                      className={`font-black font-mono text-sm px-2 py-0.5 rounded-lg ${
                        diffDays <= 7
                          ? 'bg-rose-600 text-white animate-pulse'
                          : diffDays <= 30
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#2E3944] text-white'
                      }`}
                    >
                      {diffDays === 0 ? 'DNES!' : diffDays === 1 ? '1 den' : `${diffDays} dní`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Dlouhodobá časová osa (Měsíce dopředu) */}
      <div className="bg-[#212A31] border border-[#2E3944] rounded-2xl p-5 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-[#124E66]" />
          <span>Dlouhodobý výhled po měsících</span>
        </h2>

        {monthsMap.size === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[#2E3944] text-center text-xs text-[#748D92]">
            Nemáš zatím žádné jednorázové události ani deadliny na další měsíce.
            Můžeš si je vytvořit ručně nebo požádat AI asistenta o měsíční roadmapu.
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(monthsMap.entries()).map(([monthKey, monthEvents]) => {
              const [y, m] = monthKey.split('-');
              const monthName = MONTH_NAMES[parseInt(m, 10) - 1];

              return (
                <div key={monthKey} className="border-l-2 border-[#124E66] pl-4 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400">
                    {monthName} {y} ({monthEvents.length} {monthEvents.length === 1 ? 'událost' : 'událostí'})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {monthEvents.map(evt => {
                      const cat = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.STUDY;
                      const Icon = cat.icon;

                      return (
                        <div
                          key={evt.id}
                          onClick={() => onEditEvent(evt)}
                          className={`p-3 rounded-xl border ${cat.bg} ${cat.border} hover:border-[#748D92]/50 transition cursor-pointer flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className={`font-semibold flex items-center gap-1 ${cat.text}`}>
                                <Icon className="w-3 h-3" />
                                {cat.label}
                              </span>
                              <span className="font-mono text-[#D3D9D4] bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
                                {evt.date}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-white line-clamp-1">{evt.title}</h4>
                            {evt.description && (
                              <p className="text-[11px] text-[#748D92] line-clamp-1 mt-0.5">
                                {evt.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 text-[10px] text-[#748D92] flex items-center justify-between">
                            <span>{evt.startTime} - {evt.endTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

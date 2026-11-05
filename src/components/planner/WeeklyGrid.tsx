'use client';

import React from 'react';
import { ScheduleEvent, EventCategory } from '@/types';
import { CATEGORY_CONFIG, CZECH_DAYS } from './plannerConstants';
import { Clock, Plus, CheckCircle, Circle, RotateCw, Calendar } from 'lucide-react';

interface WeeklyGridProps {
  events: ScheduleEvent[];
  selectedCategory: string;
  onEditEvent: (event: ScheduleEvent) => void;
  onToggleComplete: (event: ScheduleEvent) => void;
  onAddEventForDay: (dayOfWeek: number) => void;
}

export function WeeklyGrid({
  events,
  selectedCategory,
  onEditEvent,
  onToggleComplete,
  onAddEventForDay
}: WeeklyGridProps) {
  // Filtrování událostí
  const filteredEvents = events.filter(e => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {CZECH_DAYS.map((day) => {
        // Získat události pro daný den v týdnu
        const dayEvents = filteredEvents.filter(e => {
          if (e.recurrence === 'WEEKLY' && e.daysOfWeek) {
            return e.daysOfWeek.includes(day.id);
          }
          if (e.recurrence === 'DAILY') {
            return true;
          }
          if (e.recurrence === 'NONE' && e.date) {
            // Určit den v týdnu z data
            const dateObj = new Date(e.date);
            const jsDay = dateObj.getDay(); // 0 = Neděle, 1 = Pondělí ...
            const czechDayId = jsDay === 0 ? 7 : jsDay;
            return czechDayId === day.id;
          }
          return false;
        });

        // Seřadit podle času začátku
        dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

        const isWeekend = day.id === 6 || day.id === 7;

        return (
          <div
            key={day.id}
            className={`rounded-2xl border flex flex-col min-h-[380px] transition ${
              isWeekend
                ? 'bg-[#212A31]/40 border-[#2E3944]/60'
                : 'bg-[#212A31] border-[#2E3944]'
            }`}
          >
            {/* Header dne */}
            <div className="p-3.5 border-b border-[#2E3944] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#D3D9D4] flex items-center gap-1.5">
                  <span>{day.name}</span>
                </h3>
                <span className="text-[11px] text-[#748D92]">
                  {dayEvents.length} {dayEvents.length === 1 ? 'aktivita' : dayEvents.length >= 2 && dayEvents.length <= 4 ? 'aktivity' : 'aktivit'}
                </span>
              </div>
              <button
                onClick={() => onAddEventForDay(day.id)}
                className="p-1 rounded-lg text-[#748D92] hover:text-white hover:bg-[#2E3944] transition"
                title={`Přidat aktivitu na ${day.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Seznam událostí dne */}
            <div className="p-2.5 flex-1 space-y-2 overflow-y-auto">
              {dayEvents.length === 0 ? (
                <div
                  onClick={() => onAddEventForDay(day.id)}
                  className="h-32 rounded-xl border border-dashed border-[#2E3944] hover:border-[#748D92]/40 flex flex-col items-center justify-center text-[#748D92]/60 hover:text-[#748D92] cursor-pointer transition text-xs group"
                >
                  <Plus className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                  <span>Volno</span>
                </div>
              ) : (
                dayEvents.map((evt) => {
                  const cat = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.STUDY;
                  const Icon = cat.icon;
                  const isCompleted = !!evt.isCompleted;

                  return (
                    <div
                      key={evt.id}
                      className={`group relative p-2.5 rounded-xl border transition cursor-pointer ${
                        isCompleted
                          ? 'bg-[#2E3944]/30 border-[#2E3944] opacity-60'
                          : `${cat.bg} ${cat.border} hover:border-[#748D92]/60 shadow-sm`
                      }`}
                      onClick={() => onEditEvent(evt)}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${cat.text}`} />
                          <span
                            className={`text-xs font-semibold truncate ${
                              isCompleted ? 'line-through text-[#748D92]' : 'text-white'
                            }`}
                          >
                            {evt.title}
                          </span>
                        </div>

                        {/* Splněno checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(evt);
                          }}
                          className="shrink-0 text-[#748D92] hover:text-emerald-400 transition"
                          title={isCompleted ? 'Označit jako nesplněné' : 'Označit jako splněné'}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {evt.description && (
                        <p className="text-[11px] text-[#748D92] line-clamp-2 mt-1">
                          {evt.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px]">
                        <span className="font-mono text-[#D3D9D4] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#748D92]" />
                          {evt.startTime} - {evt.endTime}
                        </span>

                        {evt.recurrence === 'NONE' ? (
                          <span className="text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40 font-medium">
                            Jednorázová
                          </span>
                        ) : (
                          <span className="text-[#748D92] flex items-center gap-0.5">
                            <RotateCw className="w-2.5 h-2.5" />
                            Týdně
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

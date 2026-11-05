'use client';

import React, { useState } from 'react';
import { ScheduleEvent, EventCategory, RecurrenceFrequency } from '@/types';
import { CATEGORY_CONFIG, CZECH_DAYS } from './plannerConstants';
import { X, Calendar, Clock, RotateCw, Trash2, Tag, FileText } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialEvent?: ScheduleEvent | null;
  defaultDate?: string;
  defaultDayOfWeek?: number;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  defaultDate,
  defaultDayOfWeek
}: EventModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category || 'STUDY');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '16:00');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '17:30');
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>(
    initialEvent?.recurrence || (defaultDate ? 'NONE' : 'WEEKLY')
  );
  const [date, setDate] = useState(
    initialEvent?.date || defaultDate || new Date().toISOString().split('T')[0]
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialEvent?.daysOfWeek || (defaultDayOfWeek ? [defaultDayOfWeek] : [1])
  );
  const [loading, setLoading] = useState(false);

  const toggleDay = (dayId: number) => {
    if (daysOfWeek.includes(dayId)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter(d => d !== dayId));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, dayId].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        startTime,
        endTime,
        recurrence,
        daysOfWeek: recurrence === 'WEEKLY' ? daysOfWeek : undefined,
        date: recurrence === 'NONE' ? date : undefined,
        isCompleted: initialEvent?.isCompleted ?? false
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#212A31] border border-[#2E3944] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#2E3944] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#D3D9D4] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#124E66]" />
            <span>{initialEvent ? 'Upravit aktivitu' : 'Nová aktivita / blok rozvrhu'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#748D92] hover:text-white hover:bg-[#2E3944] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Název */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
              Název aktivity *
            </label>
            <input
              type="text"
              required
              placeholder="Např. Příprava na maturitu z matematiky, Trénink florbalu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#2E3944] border border-[#748D92]/30 text-[#D3D9D4] focus:outline-none focus:border-[#124E66] focus:ring-1 focus:ring-[#124E66] text-sm"
            />
          </div>

          {/* Kategorie */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
              Kategorie
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((catKey) => {
                const config = CATEGORY_CONFIG[catKey];
                const Icon = config.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      isSelected
                        ? `${config.bg} ${config.text} ${config.border} ring-1 ring-white/20 shadow`
                        : 'bg-[#2E3944]/50 border-transparent text-[#748D92] hover:bg-[#2E3944]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opakování vs Jednorázová akce */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
              Typ plánování
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecurrence('WEEKLY')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  recurrence === 'WEEKLY'
                    ? 'bg-[#124E66] text-white border-[#748D92]/40 shadow'
                    : 'bg-[#2E3944] text-[#748D92] border-transparent hover:text-[#D3D9D4]'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>Opakovat týdně (Rozvrh)</span>
              </button>
              <button
                type="button"
                onClick={() => setRecurrence('NONE')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  recurrence === 'NONE'
                    ? 'bg-[#124E66] text-white border-[#748D92]/40 shadow'
                    : 'bg-[#2E3944] text-[#748D92] border-transparent hover:text-[#D3D9D4]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Jednorázová (Zkouška/Test)</span>
              </button>
            </div>
          </div>

          {/* Podmíněná volba: Dny v týdnu NEBO Konkrétní Datum */}
          {recurrence === 'WEEKLY' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
                Vyber dny v týdnu
              </label>
              <div className="flex gap-1.5 justify-between">
                {CZECH_DAYS.map((day) => {
                  const isChecked = daysOfWeek.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        isChecked
                          ? 'bg-[#124E66] text-white border-[#748D92]/50 shadow-sm'
                          : 'bg-[#2E3944]/60 text-[#748D92] border-transparent hover:bg-[#2E3944]'
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
                Konkrétní datum
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2E3944] border border-[#748D92]/30 text-[#D3D9D4] focus:outline-none focus:border-[#124E66] text-sm"
              />
            </div>
          )}

          {/* Čas od - do */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
                Čas začátku
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#2E3944] border border-[#748D92]/30 text-[#D3D9D4] focus:outline-none focus:border-[#124E66] text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
                Čas konce
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#2E3944] border border-[#748D92]/30 text-[#D3D9D4] focus:outline-none focus:border-[#124E66] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Popis / cíl */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
              Poznámka / Konkrétní témata studia
            </label>
            <textarea
              rows={2}
              placeholder="Např. Planimetrie a stereometrie, slovíčka lekce 3..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#2E3944] border border-[#748D92]/30 text-[#D3D9D4] focus:outline-none focus:border-[#124E66] text-sm resize-none"
            />
          </div>

          {/* Akce */}
          <div className="pt-2 flex items-center justify-between border-t border-[#2E3944]">
            {initialEvent && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Opravdu smazat tuto aktivitu?')) {
                    setLoading(true);
                    await onDelete(initialEvent.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-950/30 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#2E3944] transition"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#124E66] text-white hover:bg-[#124E66]/80 transition disabled:opacity-50 shadow-md"
              >
                {loading ? 'Ukládám...' : initialEvent ? 'Uložit změny' : 'Přidat do rozvrhu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

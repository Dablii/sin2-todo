'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ScheduleEvent, EventCategory } from '@/types';
import {
  subscribeScheduleEvents,
  createScheduleEvent,
  createMultipleScheduleEvents,
  updateScheduleEvent,
  deleteScheduleEvent
} from '@/lib/firestore';
import { WeeklyGrid } from '@/components/planner/WeeklyGrid';
import { MonthlyView } from '@/components/planner/MonthlyView';
import { LongTermRoadmap } from '@/components/planner/LongTermRoadmap';
import { EventModal } from '@/components/planner/EventModal';
import { AiPlannerModal } from '@/components/planner/AiPlannerModal';
import { CATEGORY_CONFIG } from '@/components/planner/plannerConstants';
import {
  CalendarDays,
  Sparkles,
  Plus,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';

type PlannerViewMode = 'WEEK' | 'MONTH' | 'ROADMAP';

export default function PlannerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Zobrazení: Týden, Měsíc, Roadmapa
  const [viewMode, setViewMode] = useState<PlannerViewMode>('WEEK');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modály
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState<string | undefined>(undefined);
  const [defaultDayOfWeekForModal, setDefaultDayOfWeekForModal] = useState<number | undefined>(undefined);

  // Ochrana přihlášení
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Načtení dat z Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeScheduleEvents(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#124E66] border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Obsluha uložení události (vytvoření / update)
  const handleSaveEvent = async (data: Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    if (editingEvent) {
      await updateScheduleEvent(editingEvent.id, data);
    } else {
      await createScheduleEvent({
        ...data,
        userId: user.uid
      });
    }
  };

  // Smazání
  const handleDeleteEvent = async (id: string) => {
    await deleteScheduleEvent(id);
  };

  // Přepnutí splněno
  const handleToggleComplete = async (event: ScheduleEvent) => {
    await updateScheduleEvent(event.id, {
      isCompleted: !event.isCompleted
    });
  };

  // Aplikace plánu z AI asistenta
  const handleApplyAiPlan = async (aiEvents: Array<Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) return;
    const withUserId = aiEvents.map(e => ({
      ...e,
      userId: user.uid
    }));
    await createMultipleScheduleEvents(withUserId);
  };

  // Otevření modálu pro konkrétní den
  const handleAddForDayOfWeek = (dayOfWeek: number) => {
    setEditingEvent(null);
    setDefaultDateForModal(undefined);
    setDefaultDayOfWeekForModal(dayOfWeek);
    setIsEventModalOpen(true);
  };

  const handleSelectDateFromMonth = (dateStr: string) => {
    setEditingEvent(null);
    setDefaultDateForModal(dateStr);
    setDefaultDayOfWeekForModal(undefined);
    setIsEventModalOpen(true);
  };

  // Statistiky
  const totalStudyEvents = events.filter(e => e.category === 'STUDY').length;
  const totalExams = events.filter(e => e.category === 'EXAM').length;
  const completedEvents = events.filter(e => e.isCompleted).length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Horní hlavička stránky */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#212A31] p-5 sm:p-6 rounded-2xl border border-[#2E3944] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#124E66] text-emerald-300 flex items-center justify-center border border-[#748D92]/30 shadow-md">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Rozvrh & Studijní plán
              </h1>
              <p className="text-xs sm:text-sm text-[#748D92]">
                Týdenní režim, měsíční přehled a dlouhodobá příprava na maturitu a zkoušky
              </p>
            </div>
          </div>
        </div>

        {/* Akční tlačítka */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950/40"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>AI Plánovač</span>
          </button>

          <button
            onClick={() => {
              setEditingEvent(null);
              setDefaultDateForModal(undefined);
              setDefaultDayOfWeekForModal(undefined);
              setIsEventModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-white font-semibold text-xs transition shadow-md border border-[#748D92]/30"
          >
            <Plus className="w-4 h-4" />
            <span>Nová aktivita</span>
          </button>
        </div>
      </div>

      {/* Rychlé statistiky */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#212A31] border border-[#2E3944] p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#748D92] block">V rozvrhu</span>
            <span className="text-base font-bold text-white">{events.length} aktivit</span>
          </div>
        </div>

        <div className="bg-[#212A31] border border-[#2E3944] p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#748D92] block">Zkoušky & Testy</span>
            <span className="text-base font-bold text-rose-300">{totalExams} termínů</span>
          </div>
        </div>

        <div className="bg-[#212A31] border border-[#2E3944] p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#124E66]/30 text-sky-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#748D92] block">Studijní bloky</span>
            <span className="text-base font-bold text-white">{totalStudyEvents} týdně</span>
          </div>
        </div>

        <div className="bg-[#212A31] border border-[#2E3944] p-3.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#748D92] block">Odškrtnuto</span>
            <span className="text-base font-bold text-emerald-300">{completedEvents} splněno</span>
          </div>
        </div>
      </div>

      {/* Ovládací lišta: Přepínač zobrazení + Kategorie filtr */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#212A31] p-3 rounded-2xl border border-[#2E3944]">
        {/* Přepínač Týden / Měsíc / Roadmapa */}
        <div className="flex items-center gap-1.5 bg-[#2E3944]/50 p-1 rounded-xl border border-[#748D92]/20">
          <button
            onClick={() => setViewMode('WEEK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'WEEK'
                ? 'bg-[#124E66] text-white shadow'
                : 'text-[#748D92] hover:text-[#D3D9D4]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Týdenní rozvrh</span>
          </button>

          <button
            onClick={() => setViewMode('MONTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'MONTH'
                ? 'bg-[#124E66] text-white shadow'
                : 'text-[#748D92] hover:text-[#D3D9D4]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Měsíční kalendář</span>
          </button>

          <button
            onClick={() => setViewMode('ROADMAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'ROADMAP'
                ? 'bg-[#124E66] text-white shadow'
                : 'text-[#748D92] hover:text-[#D3D9D4]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-300" />
            <span>Dlouhodobý výhled (Měsíc+)</span>
          </button>
        </div>

        {/* Filtr kategorií */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-[#2E3944] text-white border-[#748D92]/40'
                : 'bg-transparent text-[#748D92] border-transparent hover:text-[#D3D9D4]'
            }`}
          >
            Vše
          </button>
          {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((catKey) => {
            const config = CATEGORY_CONFIG[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition shrink-0 ${
                  isSelected
                    ? `${config.bg} ${config.text} ${config.border}`
                    : 'bg-transparent text-[#748D92] border-transparent hover:text-[#D3D9D4]'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hlavní obsah dle vybraného módu */}
      {viewMode === 'WEEK' && (
        <WeeklyGrid
          events={events}
          selectedCategory={selectedCategory}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setDefaultDateForModal(event.date);
            setDefaultDayOfWeekForModal(event.daysOfWeek?.[0]);
            setIsEventModalOpen(true);
          }}
          onToggleComplete={handleToggleComplete}
          onAddEventForDay={handleAddForDayOfWeek}
        />
      )}

      {viewMode === 'MONTH' && (
        <MonthlyView
          events={events}
          selectedCategory={selectedCategory}
          onSelectDate={handleSelectDateFromMonth}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setDefaultDateForModal(event.date);
            setIsEventModalOpen(true);
          }}
        />
      )}

      {viewMode === 'ROADMAP' && (
        <LongTermRoadmap
          events={events}
          onAddExam={() => {
            setEditingEvent(null);
            setDefaultDateForModal(new Date().toISOString().split('T')[0]);
            setIsEventModalOpen(true);
          }}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setDefaultDateForModal(event.date);
            setIsEventModalOpen(true);
          }}
        />
      )}

      {/* Modální okno pro manuální přidání / editaci */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        initialEvent={editingEvent}
        defaultDate={defaultDateForModal}
        defaultDayOfWeek={defaultDayOfWeekForModal}
      />

      {/* Modální okno pro AI asistenta */}
      <AiPlannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentEvents={events}
        onApplyPlan={handleApplyAiPlan}
      />
    </div>
  );
}

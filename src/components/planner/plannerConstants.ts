import React from 'react';
import { EventCategory } from '@/types';
import { BookOpen, Award, Dumbbell, Coffee, User } from 'lucide-react';

export const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; bg: string; text: string; border: string; badgeBg: string; icon: any }
> = {
  STUDY: {
    label: 'Studium & Škola',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-200',
    border: 'border-emerald-600/40',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: BookOpen,
  },
  EXAM: {
    label: 'Zkouška / SCIO / Maturita',
    bg: 'bg-rose-950/50',
    text: 'text-rose-200',
    border: 'border-rose-600/50',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: Award,
  },
  SPORT: {
    label: 'Sport & Trénink',
    bg: 'bg-amber-950/40',
    text: 'text-amber-200',
    border: 'border-amber-600/40',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Dumbbell,
  },
  LEISURE: {
    label: 'Volno & Relax',
    bg: 'bg-sky-950/40',
    text: 'text-sky-200',
    border: 'border-sky-600/40',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    icon: Coffee,
  },
  PERSONAL: {
    label: 'Osobní',
    bg: 'bg-purple-950/40',
    text: 'text-purple-200',
    border: 'border-purple-600/40',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: User,
  },
};

export const CZECH_DAYS = [
  { id: 1, name: 'Pondělí', short: 'Po' },
  { id: 2, name: 'Úterý', short: 'Út' },
  { id: 3, name: 'Středa', short: 'St' },
  { id: 4, name: 'Čtvrtek', short: 'Čt' },
  { id: 5, name: 'Pátek', short: 'Pá' },
  { id: 6, name: 'Sobota', short: 'So' },
  { id: 7, name: 'Neděle', short: 'Ne' },
];

export const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

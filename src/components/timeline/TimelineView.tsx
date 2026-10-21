'use client';

import React from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  Clock3,
  User,
  CheckSquare
} from 'lucide-react';
import { Task, Section, UserProfile, Priority, TaskStatus } from '@/types';
import { updateTaskStatus } from '@/lib/firestore';

interface Props {
  tasks: Task[];
  sections: Section[];
  members: UserProfile[];
  onOpenTaskModal: (task: Task) => void;
}

export function TimelineView({ tasks, sections, members, onOpenTaskModal }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate dates for classification
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = in7Days.toISOString().split('T')[0];

  // Group tasks
  const overdue: Task[] = [];
  const todayTomorrow: Task[] = [];
  const thisWeek: Task[] = [];
  const later: Task[] = [];
  const noDeadline: Task[] = [];

  tasks.forEach((t) => {
    if (!t.deadline) {
      noDeadline.push(t);
      return;
    }

    if (t.status !== 'DONE' && t.deadline < todayStr) {
      overdue.push(t);
    } else if (t.deadline === todayStr || t.deadline === tomorrowStr) {
      todayTomorrow.push(t);
    } else if (t.deadline > tomorrowStr && t.deadline <= in7DaysStr) {
      thisWeek.push(t);
    } else if (t.deadline > in7DaysStr) {
      later.push(t);
    } else {
      // Completed past tasks
      later.push(t);
    }
  });

  // Sort inside groups by deadline
  const sortByDeadline = (a: Task, b: Task) => (a.deadline || '').localeCompare(b.deadline || '');
  overdue.sort(sortByDeadline);
  todayTomorrow.sort(sortByDeadline);
  thisWeek.sort(sortByDeadline);
  later.sort(sortByDeadline);

  const priorityBadge: Record<Priority, string> = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-rose-100 text-rose-700'
  };

  const statusIcons: Record<TaskStatus, React.ReactNode> = {
    TODO: <Circle className="w-4 h-4 text-slate-400" />,
    IN_PROGRESS: <Clock3 className="w-4 h-4 text-indigo-500" />,
    DONE: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  };

  const renderTaskRow = (task: Task, isOverdueAlert: boolean = false) => {
    const sec = sections.find((s) => s.id === task.sectionId);
    const completedSubs = task.subtasks?.filter((s) => s.isCompleted).length || 0;
    const totalSubs = task.subtasks?.length || 0;

    return (
      <div
        key={task.id}
        onClick={() => onOpenTaskModal(task)}
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition cursor-pointer hover:shadow-xs group ${
          isOverdueAlert
            ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
            : 'bg-white border-slate-200 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus: TaskStatus =
                task.status === 'DONE' ? 'TODO' : 'DONE';
              updateTaskStatus(task.id, nextStatus);
            }}
            title={task.status === 'DONE' ? 'Označit jako nedokončené' : 'Označit jako hotové'}
            className="p-1 hover:bg-slate-100 rounded-lg transition shrink-0 mt-0.5 sm:mt-0"
          >
            {statusIcons[task.status]}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold group-hover:text-indigo-600 transition truncate ${
                  task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {task.title}
              </span>

              {sec && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {sec.title}
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Right side info: Subtasks, Assignee, Priority, Deadline */}
        <div className="flex items-center gap-3 mt-3 sm:mt-0 shrink-0 self-end sm:self-center">
          {totalSubs > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>
                {completedSubs}/{totalSubs}
              </span>
            </span>
          )}

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              priorityBadge[task.priority]
            }`}
          >
            {task.priority === 'HIGH' ? 'Vysoká' : task.priority === 'MEDIUM' ? 'Střední' : 'Nízká'}
          </span>

          {task.assigneeName && (
            <div
              className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs"
              title={`Přiřazeno: ${task.assigneeName}`}
            >
              {task.assigneeName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
              isOverdueAlert
                ? 'bg-rose-100 text-rose-800 font-bold'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{task.deadline || 'Bez termínu'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 🔴 Po termínu (Overdue) */}
      {overdue.length > 0 && (
        <section className="bg-rose-50/30 border border-rose-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3.5 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Po termínu ({overdue.length})</span>
            <span className="text-xs font-normal text-rose-500">
              — Tyto úkoly již překročily svůj deadline a vyžadují pozornost!
            </span>
          </div>
          <div className="space-y-2.5">
            {overdue.map((t) => renderTaskRow(t, true))}
          </div>
        </section>
      )}

      {/* 🟡 Dnes a zítra */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Dnes a zítra ({todayTomorrow.length})</span>
        </div>
        {todayTomorrow.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
            Žádné úkoly s termínem dnes ani zítra.
          </div>
        ) : (
          <div className="space-y-2">
            {todayTomorrow.map((t) => renderTaskRow(t, false))}
          </div>
        )}
      </section>

      {/* 🔵 Tento týden */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Nadcházející tento týden ({thisWeek.length})</span>
        </div>
        {thisWeek.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
            Žádné další úkoly s termínem v následujících 7 dnech.
          </div>
        ) : (
          <div className="space-y-2">
            {thisWeek.map((t) => renderTaskRow(t, false))}
          </div>
        )}
      </section>

      {/* 🟣 Později */}
      {later.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Později / Dokončené ({later.length})</span>
          </div>
          <div className="space-y-2">
            {later.map((t) => renderTaskRow(t, false))}
          </div>
        </section>
      )}

      {/* ⚪ Bez termínu */}
      {noDeadline.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Bez termínu ({noDeadline.length})</span>
          </div>
          <div className="space-y-2">
            {noDeadline.map((t) => renderTaskRow(t, false))}
          </div>
        </section>
      )}
    </div>
  );
}

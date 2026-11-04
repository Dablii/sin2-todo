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
    LOW: 'bg-[#212A31] text-[#748D92] border border-[#748D92]/20',
    MEDIUM: 'bg-[#124E66]/40 text-amber-300 border border-[#124E66]',
    HIGH: 'bg-rose-950/60 text-rose-300 border border-rose-800'
  };

  const statusIcons: Record<TaskStatus, React.ReactNode> = {
    TODO: <Circle className="w-4 h-4 text-[#748D92]" />,
    IN_PROGRESS: <Clock3 className="w-4 h-4 text-sky-400" />,
    DONE: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
  };

  const renderTaskRow = (task: Task, isOverdueAlert: boolean = false) => {
    const sec = sections.find((s) => s.id === task.sectionId);
    const completedSubs = task.subtasks?.filter((s) => s.isCompleted).length || 0;
    const totalSubs = task.subtasks?.length || 0;

    return (
      <div
        key={task.id}
        onClick={() => onOpenTaskModal(task)}
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition cursor-pointer hover:shadow-md group ${
          isOverdueAlert
            ? 'bg-rose-950/30 border-rose-800/60 hover:border-rose-600'
            : 'bg-[#2E3944] border-[#748D92]/30 hover:border-[#748D92]/80'
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
            className="p-1 hover:bg-[#212A31] rounded-lg transition shrink-0 mt-0.5 sm:mt-0"
          >
            {statusIcons[task.status]}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold group-hover:text-white transition truncate ${
                  task.status === 'DONE' ? 'line-through text-[#748D92]' : 'text-[#D3D9D4]'
                }`}
              >
                {task.title}
              </span>

              {sec && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#124E66]/40 text-[#D3D9D4] border border-[#124E66]">
                  {sec.title}
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-[#748D92] mt-0.5 truncate max-w-xl">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Right side info: Subtasks, Assignee, Priority, Deadline */}
        <div className="flex items-center gap-3 mt-3 sm:mt-0 shrink-0 self-end sm:self-center">
          {totalSubs > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#748D92] font-medium">
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
              className="w-6 h-6 rounded-full bg-[#124E66] text-[#D3D9D4] font-bold text-[10px] flex items-center justify-center border border-[#748D92]/30"
              title={`Přiřazeno: ${task.assigneeName}`}
            >
              {task.assigneeName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              isOverdueAlert
                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                : 'bg-[#212A31] text-[#D3D9D4] border-[#748D92]/30'
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
      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Po termínu ({overdue.length})</span>
          </div>
          <div className="space-y-2">
            {overdue.map((t) => renderTaskRow(t, true))}
          </div>
        </div>
      )}

      {/* Today / Tomorrow Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#D3D9D4] font-bold text-sm">
          <Calendar className="w-4 h-4 text-[#124E66]" />
          <span>Dnes a zítra ({todayTomorrow.length})</span>
        </div>
        {todayTomorrow.length === 0 ? (
          <p className="text-xs text-[#748D92] italic pl-6">
            Žádné úkoly s termínem na dnes ani zítra.
          </p>
        ) : (
          <div className="space-y-2">
            {todayTomorrow.map((t) => renderTaskRow(t))}
          </div>
        )}
      </div>

      {/* Next 7 Days */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#D3D9D4] font-bold text-sm">
          <Calendar className="w-4 h-4 text-[#124E66]" />
          <span>V následujících 7 dnech ({thisWeek.length})</span>
        </div>
        {thisWeek.length === 0 ? (
          <p className="text-xs text-[#748D92] italic pl-6">
            Žádné naplánované úkoly v příštím týdnu.
          </p>
        ) : (
          <div className="space-y-2">{thisWeek.map((t) => renderTaskRow(t))}</div>
        )}
      </div>

      {/* Later */}
      {later.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#748D92] font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <span>Později / Dokončené ({later.length})</span>
          </div>
          <div className="space-y-2">{later.map((t) => renderTaskRow(t))}</div>
        </div>
      )}

      {/* No Deadline */}
      {noDeadline.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#748D92] font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Bez stanoveného termínu ({noDeadline.length})</span>
          </div>
          <div className="space-y-2">
            {noDeadline.map((t) => renderTaskRow(t))}
          </div>
        </div>
      )}
    </div>
  );
}

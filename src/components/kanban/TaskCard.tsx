'use client';

import React from 'react';
import { Calendar, CheckSquare, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Task, Section, Priority, TaskStatus } from '@/types';

interface Props {
  task: Task;
  sections: Section[];
  onOpenDetail: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export function TaskCard({
  task,
  sections,
  onOpenDetail,
  onStatusChange,
  onDragStart
}: Props) {
  const section = sections.find((s) => s.id === task.sectionId);

  // Check if deadline is overdue (only if not DONE)
  const isOverdue = React.useMemo(() => {
    if (!task.deadline || task.status === 'DONE') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.deadline < today;
  }, [task.deadline, task.status]);

  // Subtasks progress
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const priorityStyles: Record<Priority, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Nízká' },
    MEDIUM: { bg: 'bg-amber-100/70', text: 'text-amber-700', label: 'Střední' },
    HIGH: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Vysoká' }
  };

  const pConfig = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpenDetail(task)}
      className="bg-white rounded-xl p-4 shadow-xs hover:shadow-md border border-slate-200 hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group select-none relative"
    >
      {/* Top badges: Section & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {section ? (
          <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[140px]">
            {section.title}
          </span>
        ) : (
          <span />
        )}

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${pConfig.bg} ${pConfig.text}`}
        >
          {pConfig.label}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview if present */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom meta: Subtasks, Deadline, Assignee */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Subtasks count */}
          {totalSubtasks > 0 && (
            <span
              className={`flex items-center gap-1 font-medium ${
                completedSubtasks === totalSubtasks
                  ? 'text-emerald-600'
                  : 'text-slate-500'
              }`}
              title="Splněné podúkoly"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}

          {/* Deadline */}
          {task.deadline && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded'
                  : 'text-slate-500'
              }`}
              title={isOverdue ? 'Po termínu!' : 'Termín dokončení'}
            >
              {isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{task.deadline}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assigneeName ? (
          <div
            className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs shrink-0"
            title={`Přiřazeno: ${task.assigneeName}`}
          >
            {task.assigneeName.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px] flex items-center justify-center border border-dashed border-slate-300 shrink-0"
            title="Bez přiřazení"
          >
            —
          </div>
        )}
      </div>
    </div>
  );
}

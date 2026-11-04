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
    LOW: { bg: 'bg-[#212A31]', text: 'text-[#748D92]', label: 'Nízká' },
    MEDIUM: { bg: 'bg-[#124E66]/40', text: 'text-amber-300', label: 'Střední' },
    HIGH: { bg: 'bg-rose-950/60', text: 'text-rose-300', label: 'Vysoká' }
  };

  const pConfig = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpenDetail(task)}
      className="bg-[#212A31] rounded-xl p-4 shadow-sm hover:shadow-md border border-[#748D92]/30 hover:border-[#748D92]/70 transition-all cursor-grab active:cursor-grabbing group select-none relative"
    >
      {/* Top badges: Section & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {section ? (
          <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-[#124E66]/40 text-[#D3D9D4] border border-[#124E66] truncate max-w-[140px]">
            {section.title}
          </span>
        ) : (
          <span />
        )}

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#748D92]/20 ${pConfig.bg} ${pConfig.text}`}
        >
          {pConfig.label}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-[#D3D9D4] group-hover:text-white transition mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview if present */}
      {task.description && (
        <p className="text-xs text-[#748D92] mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom meta: Subtasks, Deadline, Assignee */}
      <div className="pt-2 border-t border-[#748D92]/15 flex items-center justify-between gap-2 text-xs text-[#748D92]">
        <div className="flex items-center gap-3">
          {/* Subtasks count */}
          {totalSubtasks > 0 && (
            <span
              className={`flex items-center gap-1 font-medium ${
                completedSubtasks === totalSubtasks
                  ? 'text-emerald-400'
                  : 'text-[#748D92]'
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
                isOverdue ? 'text-rose-400 font-bold' : 'text-[#748D92]'
              }`}
              title={isOverdue ? 'Termín vypršel!' : 'Termín splnění'}
            >
              {isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              <span>{task.deadline}</span>
            </span>
          )}
        </div>

        {/* Assignee pill */}
        {task.assigneeName && (
          <div
            className="flex items-center gap-1.5 bg-[#2E3944] px-2 py-0.5 rounded-full border border-[#748D92]/20"
            title={`Přiřazeno: ${task.assigneeName}`}
          >
            <div className="w-4 h-4 rounded-full bg-[#124E66] text-[#D3D9D4] text-[9px] font-bold flex items-center justify-center">
              {task.assigneeName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-[10px] text-[#D3D9D4] max-w-[80px] truncate">
              {task.assigneeName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

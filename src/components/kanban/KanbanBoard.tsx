'use client';

import React, { useState } from 'react';
import { Plus, Filter, Circle, Clock3, CheckCircle2 } from 'lucide-react';
import { Task, Section, UserProfile, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { updateTaskStatus } from '@/lib/firestore';

interface Props {
  tasks: Task[];
  sections: Section[];
  members: UserProfile[];
  onOpenTaskModal: (task: Task | null, defaultStatus?: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  headerColor: string;
  badgeColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'TODO',
    title: 'To Do',
    icon: Circle,
    headerColor: 'text-slate-700',
    badgeColor: 'bg-slate-200 text-slate-700'
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: Clock3,
    headerColor: 'text-indigo-700',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'DONE',
    title: 'Done',
    icon: CheckCircle2,
    headerColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  }
];

export function KanbanBoard({
  tasks,
  sections,
  members,
  onOpenTaskModal
}: Props) {
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedSection !== 'ALL' && task.sectionId !== selectedSection) {
      return false;
    }
    if (selectedAssignee !== 'ALL' && task.assigneeId !== selectedAssignee) {
      return false;
    }
    return true;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    try {
      await updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      console.error('Failed to update status on drop:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Filtry:
          </div>

          {/* Section filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Všechny sekce</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                Sekce: {s.title}
              </option>
            ))}
          </select>

          {/* Assignee filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Všichni členové</option>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                Přiřazeno: {m.displayName || m.email}
              </option>
            ))}
          </select>

          {(selectedSection !== 'ALL' || selectedAssignee !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedSection('ALL');
                setSelectedAssignee('ALL');
              }}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Reset filtrů
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Zobrazeno {filteredTasks.length} z {tasks.length} úkolů
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const Icon = col.icon;
          const isDropActive = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl bg-slate-100/70 p-4 border transition-all min-h-[500px] ${
                isDropActive
                  ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-300'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.headerColor}`} />
                  <h3 className={`font-bold text-sm ${col.headerColor}`}>
                    {col.title}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenTaskModal(null, col.id)}
                  title={`Přidat úkol do ${col.title}`}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks cards list */}
              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div
                    onClick={() => onOpenTaskModal(null, col.id)}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition cursor-pointer"
                  >
                    + Kliknutím přidejte úkol
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      sections={sections}
                      onOpenDetail={(task) => onOpenTaskModal(task)}
                      onStatusChange={(taskId, newStatus) =>
                        updateTaskStatus(taskId, newStatus)
                      }
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

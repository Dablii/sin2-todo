'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Flag,
  CheckCircle2,
  Trash2,
  Plus,
  AlignLeft,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { Task, Section, UserProfile, Priority, TaskStatus, Subtask } from '@/types';
import { createTask, updateTask, deleteTask } from '@/lib/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // null if creating a new task
  projectId: string;
  defaultStatus?: TaskStatus;
  sections: Section[];
  members: UserProfile[];
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  projectId,
  defaultStatus = 'TODO',
  sections,
  members
}: Props) {
  const isEditing = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [sectionId, setSectionId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setSectionId(task.sectionId || '');
      setDeadline(task.deadline || '');
      setAssigneeId(task.assigneeId || '');
      setSubtasks(task.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('MEDIUM');
      setSectionId(sections[0]?.id || '');
      setDeadline('');
      setAssigneeId(members[0]?.uid || '');
      setSubtasks([]);
    }
    setError('');
  }, [task, defaultStatus, isOpen, sections, members]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
      )
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progressPct =
    subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Název úkolu je povinný.');
      return;
    }

    setLoading(true);
    setError('');

    const assignee = members.find((m) => m.uid === assigneeId);

    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          sectionId: sectionId || undefined,
          deadline: deadline || undefined,
          assigneeId: assigneeId || undefined,
          assigneeName: assignee ? (assignee.displayName || assignee.email) : undefined,
          subtasks
        });
      } else {
        await createTask({
          projectId,
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          sectionId: sectionId || undefined,
          deadline: deadline || undefined,
          assigneeId: assigneeId || undefined,
          assigneeName: assignee ? (assignee.displayName || assignee.email) : undefined,
          subtasks,
          order: 0
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Nepodařilo se uložit úkol.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Opravdu chcete tento úkol smazat?')) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#2E3944] rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#748D92]/40 overflow-hidden my-0 sm:my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D3D9D4] bg-[#124E66] px-2.5 py-1 rounded-full border border-[#748D92]/30">
              {isEditing ? 'Detail úkolu' : 'Nový úkol'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1.5">
              Název úkolu <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Co je potřeba udělat?"
              className="w-full px-4 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-[#D3D9D4] font-semibold focus:outline-none focus:border-[#124E66] text-base transition"
            />
          </div>

          {/* Grid attributes: Stav, Priorita, Sekce, Odpovědná osoba, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#212A31]/60 p-4 rounded-xl border border-[#748D92]/20">
            {/* Stav */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#124E66]" />
                Stav
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-[#212A31] border border-[#748D92]/30 rounded-lg text-[#D3D9D4] text-xs focus:outline-none focus:border-[#124E66]"
              >
                <option value="TODO" className="bg-[#2E3944] text-[#D3D9D4]">To Do</option>
                <option value="IN_PROGRESS" className="bg-[#2E3944] text-[#D3D9D4]">In Progress</option>
                <option value="DONE" className="bg-[#2E3944] text-[#D3D9D4]">Done</option>
              </select>
            </div>

            {/* Priorita */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#124E66]" />
                Priorita
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-[#212A31] border border-[#748D92]/30 rounded-lg text-[#D3D9D4] text-xs focus:outline-none focus:border-[#124E66]"
              >
                <option value="LOW" className="bg-[#2E3944] text-[#D3D9D4]">Nízká</option>
                <option value="MEDIUM" className="bg-[#2E3944] text-[#D3D9D4]">Střední</option>
                <option value="HIGH" className="bg-[#2E3944] text-[#D3D9D4]">Vysoká</option>
              </select>
            </div>

            {/* Sekce */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#124E66]" />
                Sekce projektu
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2 bg-[#212A31] border border-[#748D92]/30 rounded-lg text-[#D3D9D4] text-xs focus:outline-none focus:border-[#124E66]"
              >
                <option value="" className="bg-[#2E3944] text-[#D3D9D4]">Bez sekce</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#2E3944] text-[#D3D9D4]">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Odpovědná osoba */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#124E66]" />
                Odpovědná osoba
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-[#212A31] border border-[#748D92]/30 rounded-lg text-[#D3D9D4] text-xs focus:outline-none focus:border-[#124E66]"
              >
                <option value="" className="bg-[#2E3944] text-[#D3D9D4]">Nepřiřazeno</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid} className="bg-[#2E3944] text-[#D3D9D4]">
                    {m.displayName || m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#124E66]" />
                Termín dokončení (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#212A31] border border-[#748D92]/30 rounded-lg text-[#D3D9D4] text-xs focus:outline-none focus:border-[#124E66]"
              />
            </div>
          </div>

          {/* Popis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#748D92] mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#124E66]" />
              Podrobnější popis
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Doplňující detaily k úkolu..."
              className="w-full px-3.5 py-2.5 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-[#D3D9D4] placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66] text-sm transition resize-none"
            />
          </div>

          {/* Podúkoly */}
          <div className="border-t border-[#748D92]/20 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#748D92]">
                  Podúkoly ({completedCount}/{subtasks.length})
                </h4>
              </div>
              {subtasks.length > 0 && (
                <span className="text-xs font-semibold text-[#D3D9D4]">
                  {progressPct}% dokončeno
                </span>
              )}
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-[#212A31] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#124E66] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}

            {/* Subtasks list */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#212A31] border border-[#748D92]/20 transition group"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={() => toggleSubtask(sub.id)}
                      className="w-4 h-4 text-[#124E66] rounded border-[#748D92]/30 focus:ring-[#124E66]"
                    />
                    <span
                      className={`text-xs ${
                        sub.isCompleted ? 'line-through text-[#748D92]' : 'text-[#D3D9D4]'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSubtask(sub.id)}
                    className="text-[#748D92] hover:text-rose-400 p-1 rounded transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                placeholder="Přidat podúkol a stisknout Enter..."
                className="flex-1 px-3 py-2 bg-[#212A31] border border-[#748D92]/30 rounded-lg text-[#D3D9D4] text-xs placeholder-[#748D92]/50 focus:outline-none focus:border-[#124E66]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-[#748D92]/30"
              >
                <Plus className="w-3.5 h-3.5" />
                Přidat
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-[#748D92]/20 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-400 hover:text-rose-300 hover:bg-[#212A31] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Smazat úkol
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] font-medium text-xs transition"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer border border-[#748D92]/30"
              >
                {loading ? 'Ukládám...' : isEditing ? 'Uložit změny' : 'Vytvořit úkol'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  }, [task, defaultStatus, sections, members, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: newSubtaskTitle.trim(),
      isCompleted: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subId: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const removeSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progressPct = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Název úkolu je povinný.');
      return;
    }

    setLoading(true);
    setError('');

    const selectedMember = members.find((m) => m.uid === assigneeId);
    const assigneeName = selectedMember ? selectedMember.displayName || selectedMember.email : '';

    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          sectionId,
          deadline,
          assigneeId,
          assigneeName,
          subtasks
        });
      } else {
        await createTask({
          projectId,
          sectionId,
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          deadline,
          assigneeId,
          assigneeName,
          subtasks,
          order: Date.now()
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Chyba při ukládání úkolu.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {isEditing ? 'Detail úkolu' : 'Nový úkol'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Název úkolu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Co je potřeba udělat?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base transition"
            />
          </div>

          {/* Grid attributes: Stav, Priorita, Sekce, Odpovědná osoba, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            {/* Stav */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Stav
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priorita */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Priorita
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="LOW">Nízká</option>
                <option value="MEDIUM">Střední</option>
                <option value="HIGH">Vysoká</option>
              </select>
            </div>

            {/* Sekce */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Sekce projektu
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Bez sekce</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Odpovědná osoba */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Odpovědná osoba
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Nepřiřazeno</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName || m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Termín dokončení (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Popis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Podrobnější popis
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Doplňující detaily k úkolu..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
          </div>

          {/* Podúkoly */}
          <div className="border-t border-slate-200/80 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Podúkoly ({completedCount}/{subtasks.length})
                </h4>
              </div>
              {subtasks.length > 0 && (
                <span className="text-xs font-semibold text-indigo-600">
                  {progressPct}% dokončeno
                </span>
              )}
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}

            {/* Subtasks list */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition group"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={() => toggleSubtask(sub.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span
                      className={`text-sm ${
                        sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSubtask(sub.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
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
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Přidat
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                Smazat úkol
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
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

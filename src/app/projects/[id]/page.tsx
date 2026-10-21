'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TimelineView } from '@/components/timeline/TimelineView';
import { TaskModal } from '@/components/tasks/TaskModal';
import { SectionModal } from '@/components/sections/SectionModal';
import { MembersModal } from '@/components/projects/MembersModal';
import { Project, Section, Task, UserProfile, TaskStatus } from '@/types';
import {
  getProject,
  subscribeSections,
  subscribeTasks,
  getAllUsers
} from '@/lib/firestore';
import {
  LayoutDashboard,
  Clock,
  Plus,
  Users,
  Layers,
  ChevronLeft,
  Crown
} from 'lucide-react';

function ProjectContent() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view: 'kanban' | 'timeline'
  const [activeView, setActiveView] = useState<'kanban' | 'timeline'>('kanban');

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('TODO');
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load project details & subscribe to subcollections
  useEffect(() => {
    if (!projectId || !user) return;

    let unsubTasks: () => void;
    let unsubSections: () => void;

    getProject(projectId).then((proj) => {
      if (!proj) {
        alert('Projekt nebyl nalezen.');
        router.push('/');
        return;
      }
      setProject(proj);
      setLoading(false);

      // Listen to sections
      unsubSections = subscribeSections(projectId, (list) => {
        setSections(list);
      });

      // Listen to tasks
      unsubTasks = subscribeTasks(projectId, (list) => {
        setTasks(list);
      });

      // Fetch users for assignees
      getAllUsers().then((users) => {
        setAllUsers(users);
      });
    });

    return () => {
      if (unsubTasks) unsubTasks();
      if (unsubSections) unsubSections();
    };
  }, [projectId, user, router]);

  const refreshProject = async () => {
    if (!projectId) return;
    const p = await getProject(projectId);
    if (p) setProject(p);
  };

  const handleOpenTaskModal = (task: Task | null = null, defStatus: TaskStatus = 'TODO') => {
    setActiveTask(task);
    setDefaultTaskStatus(defStatus);
    setTaskModalOpen(true);
  };

  if (authLoading || loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Filter project members
  const projectMembers = allUsers.filter((u) => project.memberIds?.includes(u.uid));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb & Project Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Zpět na přehled projektů
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {project.title}
                </h1>
                {project.ownerId === user?.uid && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Crown className="w-3 h-3 text-amber-600" />
                    Vlastník
                  </span>
                )}
              </div>
              {project.description && (
                <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setMembersModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-2xs transition"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Členové ({project.memberIds?.length || 1})</span>
              </button>

              <button
                onClick={() => setSectionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-2xs transition"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Sekce ({sections.length})</span>
              </button>

              <button
                onClick={() => handleOpenTaskModal(null, 'TODO')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-sm shadow-indigo-200 transition"
              >
                <Plus className="w-4 h-4" />
                Přidat úkol
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher: [Kanban] vs [Časová osa] */}
        <div className="border-b border-slate-200 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-sm transition cursor-pointer ${
                activeView === 'kanban'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Kanban board
            </button>

            <button
              onClick={() => setActiveView('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-sm transition cursor-pointer ${
                activeView === 'timeline'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Časová osa (Timeline)
            </button>
          </div>
        </div>

        {/* Views Container */}
        {activeView === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            sections={sections}
            members={projectMembers}
            onOpenTaskModal={handleOpenTaskModal}
          />
        ) : (
          <TimelineView
            tasks={tasks}
            sections={sections}
            members={projectMembers}
            onOpenTaskModal={(t) => handleOpenTaskModal(t)}
          />
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={activeTask}
        projectId={project.id}
        defaultStatus={defaultTaskStatus}
        sections={sections}
        members={projectMembers}
      />

      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        projectId={project.id}
        sections={sections}
      />

      <MembersModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        project={project}
        onMembersUpdated={refreshProject}
      />
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <ProjectContent />
    </Suspense>
  );
}

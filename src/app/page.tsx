'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { Project } from '@/types';
import { subscribeUserProjects, seedDemoProject, deleteProject } from '@/lib/firestore';
import {
  FolderKanban,
  Plus,
  Sparkles,
  Users,
  ArrowRight,
  Crown,
  Calendar,
  Trash2,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserProjects(user.uid, (list) => {
      setProjects(list);
      setLoadingProjects(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSeedDemo = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const newProjectId = await seedDemoProject(
        user.uid,
        user.displayName || user.email || 'Uživatel'
      );
      router.push(`/projects/${newProjectId}`);
    } catch (err) {
      console.error(err);
      alert('Nepodařilo se vytvořit ukázkový projekt.');
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Opravdu chcete smazat tento projekt a všechny jeho úkoly?')) return;
    try {
      await deleteProject(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (!user && loadingProjects)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Moje projekty
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Přehled všech vašich projektů, úkolů a týmové práce
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {seeding ? 'Vytvářím ukázku...' : 'Nahrát ukázkový projekt'}
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nový projekt
            </button>
          </div>
        </div>

        {/* Projects grid */}
        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse p-6"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Zatím nemáte žádný projekt
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Začněte vytvořením prvního projektu, nebo klikněte na nahrání ukázkového projektu ze specifikace MVP.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition"
              >
                Nahrát vzorový projekt
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Vytvořit nový projekt
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const isOwner = proj.ownerId === user?.uid;

              return (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                        <FolderKanban className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Vlastník
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteProject(e, proj.id)}
                          title="Smazat projekt"
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {proj.description || 'Bez popisu'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {proj.memberIds?.length || 1} členů
                    </span>

                    <span className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition">
                      Otevřít
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {user && (
        <CreateProjectModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          userId={user.uid}
          onCreated={(id) => router.push(`/projects/${id}`)}
        />
      )}
    </div>
  );
}

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
  Trash2,
  Gift
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
      <div className="min-h-screen flex items-center justify-center bg-[#212A31]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#124E66]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#212A31] text-[#D3D9D4]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Christmas Feature Promotion Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#124E66]/50 via-[#2E3944] to-[#212A31] p-6 sm:p-8 border border-[#748D92]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#124E66] text-[#D3D9D4] text-xs font-bold border border-[#748D92]/40">
              <Gift className="w-3.5 h-3.5 text-rose-300" />
              <span>Vánoční update 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#D3D9D4] tracking-tight">
              Máte už všechny dárky pro své blízké?
            </h2>
            <p className="text-sm text-[#748D92]">
              Udržte si sváteční klid s novým Vánočním centrem: seznamy obdarovaných, automatické načítání cen z e-shopů, rozpočty a soukromý wishlist.
            </p>
          </div>

          <Link
            href="/christmas"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] font-semibold text-sm transition shadow-lg border border-[#748D92]/40 shrink-0 group self-start sm:self-auto"
          >
            <span>Otevřít Vánoční centrum</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#D3D9D4] tracking-tight">
              Moje projekty
            </h1>
            <p className="mt-1 text-sm text-[#748D92]">
              Přehled všech vašich projektů, úkolů a týmové práce
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#748D92]/30 bg-[#2E3944] hover:bg-[#2E3944]/80 text-[#D3D9D4] text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#748D92]" />
              <span>{seeding ? 'Vytvářím ukázku...' : 'Nahrát ukázkový projekt'}</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer border border-[#748D92]/30"
            >
              <Plus className="w-4 h-4" />
              <span>Nový projekt</span>
            </button>
          </div>
        </div>

        {/* Projects grid */}
        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-[#2E3944] border border-[#748D92]/20 animate-pulse p-6"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#2E3944] rounded-3xl border border-[#748D92]/30 p-12 text-center max-w-xl mx-auto my-12 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-[#212A31] text-[#748D92] flex items-center justify-center mx-auto mb-4 border border-[#748D92]/30">
              <FolderKanban className="w-8 h-8 text-[#124E66]" />
            </div>
            <h3 className="text-lg font-bold text-[#D3D9D4] mb-1">
              Zatím nemáte žádný projekt
            </h3>
            <p className="text-sm text-[#748D92] mb-6">
              Začněte vytvořením prvního projektu, nebo klikněte na nahrání ukázkového projektu ze specifikace MVP.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="px-4 py-2.5 rounded-xl border border-[#748D92]/30 bg-[#212A31] text-[#D3D9D4] text-sm font-semibold hover:bg-[#212A31]/80 transition"
              >
                Nahrát vzorový projekt
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#124E66] text-[#D3D9D4] text-sm font-semibold hover:bg-[#124E66]/80 transition border border-[#748D92]/30 shadow"
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
                  className="group bg-[#2E3944] rounded-2xl p-6 border border-[#748D92]/30 hover:border-[#748D92]/80 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#212A31] text-[#D3D9D4] flex items-center justify-center group-hover:scale-105 transition border border-[#748D92]/30">
                        <FolderKanban className="w-5 h-5 text-[#124E66]" />
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#124E66]/40 text-[#D3D9D4] border border-[#124E66]">
                            <Crown className="w-3 h-3 text-amber-400" />
                            Vlastník
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteProject(e, proj.id)}
                          title="Smazat projekt"
                          className="p-1.5 text-[#748D92] hover:text-rose-400 hover:bg-[#212A31] rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#D3D9D4] group-hover:text-white transition mb-2">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-[#748D92] line-clamp-2 mb-4">
                      {proj.description || 'Bez popisu'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#748D92]/20 flex items-center justify-between text-xs text-[#748D92]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#748D92]" />
                      {proj.memberIds?.length || 1} členů
                    </span>

                    <span className="flex items-center gap-1 text-[#D3D9D4] font-semibold group-hover:translate-x-0.5 transition">
                      Otevřít
                      <ArrowRight className="w-3.5 h-3.5 text-[#124E66]" />
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

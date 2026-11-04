'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Crown, Check } from 'lucide-react';
import { Project, UserProfile } from '@/types';
import { getAllUsers, addMemberToProject } from '@/lib/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onMembersUpdated: () => void;
}

export function MembersModal({ isOpen, onClose, project, onMembersUpdated }: Props) {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      getAllUsers().then((users) => {
        setAllUsers(users);
        setFetching(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMembers = allUsers.filter((u) => project.memberIds.includes(u.uid));
  const nonMembers = allUsers.filter((u) => !project.memberIds.includes(u.uid));

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await addMemberToProject(project.id, selectedUserId);
      setSelectedUserId('');
      onMembersUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#2E3944] rounded-2xl max-w-md w-full shadow-2xl border border-[#748D92]/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-[#748D92]/20 flex items-center justify-between bg-[#212A31]/50">
          <div className="flex items-center gap-2.5 font-bold text-[#D3D9D4]">
            <div className="w-8 h-8 rounded-lg bg-[#124E66] text-[#D3D9D4] flex items-center justify-center border border-[#748D92]/30">
              <Users className="w-4 h-4" />
            </div>
            <span>Členové projektu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#748D92] hover:text-[#D3D9D4] hover:bg-[#212A31] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add member section */}
          <div>
            <label className="block text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-2">
              Přidat nového člena do týmu
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={fetching || nonMembers.length === 0}
                className="flex-1 px-3.5 py-2 bg-[#212A31] border border-[#748D92]/40 rounded-xl text-[#D3D9D4] focus:outline-none focus:border-[#124E66] text-xs transition"
              >
                <option value="" className="bg-[#2E3944] text-[#D3D9D4]">
                  {fetching ? 'Načítám uživatele...' : nonMembers.length === 0 ? 'Všichni uživatelé již jsou v projektu' : 'Vyberte uživatele...'}
                </option>
                {nonMembers.map((u) => (
                  <option key={u.uid} value={u.uid} className="bg-[#2E3944] text-[#D3D9D4]">
                    {u.displayName || u.email}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedUserId || loading}
                className="px-4 py-2 bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] rounded-xl font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50 border border-[#748D92]/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Přidat</span>
              </button>
            </div>
          </div>

          {/* Current members list */}
          <div>
            <h4 className="text-xs font-semibold text-[#748D92] uppercase tracking-wider mb-3">
              Současní členové ({currentMembers.length})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {currentMembers.map((m) => {
                const isOwner = m.uid === project.ownerId;
                return (
                  <div
                    key={m.uid}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#212A31] border border-[#748D92]/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#124E66] text-[#D3D9D4] text-xs font-bold flex items-center justify-center border border-[#748D92]/30">
                        {m.displayName ? m.displayName.slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#D3D9D4]">
                          {m.displayName || m.email}
                        </div>
                        <div className="text-[10px] text-[#748D92]">{m.email}</div>
                      </div>
                    </div>

                    {isOwner ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#124E66]/40 text-[#D3D9D4] border border-[#124E66]">
                        <Crown className="w-3 h-3 text-amber-400" />
                        Vlastník
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#748D92] font-medium">Člen</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#748D92]/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#212A31] hover:bg-[#212A31]/80 text-[#D3D9D4] rounded-xl text-xs font-semibold border border-[#748D92]/30 transition"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span>Členové projektu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add member section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Přidat nového člena do týmu
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={fetching || nonMembers.length === 0}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              >
                <option value="">
                  {fetching
                    ? 'Načítám uživatele...'
                    : nonMembers.length === 0
                    ? 'Všichni uživatelé již jsou členy'
                    : 'Vyberte uživatele k přidání...'}
                </option>
                {nonMembers.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.displayName || u.email} ({u.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedUserId || loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Přidat
              </button>
            </div>
          </div>

          {/* Current members list */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Současní členové ({project.memberIds.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              {currentMembers.length === 0 && !fetching && (
                <div className="p-4 text-center text-sm text-slate-400">
                  Žádní členové kromě vás
                </div>
              )}
              {currentMembers.map((m) => {
                const isOwner = m.uid === project.ownerId;
                return (
                  <div key={m.uid} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {m.displayName ? m.displayName.slice(0, 2).toUpperCase() : 'UŽ'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          {m.displayName || m.email}
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Crown className="w-3 h-3 text-amber-600" />
                              Vlastník
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{m.email}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}

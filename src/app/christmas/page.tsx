'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { SnowfallEffect } from '@/components/christmas/SnowfallEffect';
import { FestiveCornerAccent } from '@/components/christmas/FestiveCornerAccent';
import { ChristmasStats } from '@/components/christmas/ChristmasStats';
import { RecipientCard } from '@/components/christmas/RecipientCard';
import { RecipientModal } from '@/components/christmas/RecipientModal';
import { GiftModal } from '@/components/christmas/GiftModal';
import { WishlistSection } from '@/components/christmas/WishlistSection';
import { ChristmasRecipient, GiftIdea, GiftStatus, WishlistItem, Priority } from '@/types';
import {
  subscribeChristmasRecipients,
  addChristmasRecipient,
  updateChristmasRecipient,
  deleteChristmasRecipient,
  addGiftToRecipient,
  updateGiftInRecipient,
  deleteGiftFromRecipient,
  subscribeWishlist,
  addWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
} from '@/lib/firestore';
import {
  Gift,
  Plus,
  Users,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function ChristmasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'RECIPIENTS' | 'WISHLIST'>('RECIPIENTS');
  const [recipients, setRecipients] = useState<ChristmasRecipient[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Privacy Mode (persisted)
  const [privacyMode, setPrivacyMode] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals state
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<ChristmasRecipient | null>(null);

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [targetRecipientId, setTargetRecipientId] = useState<string | null>(null);
  const [editingGift, setEditingGift] = useState<GiftIdea | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Privacy mode preference
  useEffect(() => {
    const saved = localStorage.getItem('taskflow-privacy-mode');
    if (saved !== null) {
      setPrivacyMode(saved === 'true');
    }
  }, []);

  const handleTogglePrivacy = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem('taskflow-privacy-mode', String(next));
      return next;
    });
  };

  // Subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubRecipients = subscribeChristmasRecipients(user.uid, (data) => {
      setRecipients(data);
      setLoadingData(false);
    });

    const unsubWishlist = subscribeWishlist(user.uid, (data) => {
      setWishlist(data);
    });

    return () => {
      unsubRecipients();
      unsubWishlist();
    };
  }, [user]);

  // Recipient Handlers
  const handleOpenAddRecipient = () => {
    setEditingRecipient(null);
    setIsRecipientModalOpen(true);
  };

  const handleOpenEditRecipient = (rec: ChristmasRecipient) => {
    setEditingRecipient(rec);
    setIsRecipientModalOpen(true);
  };

  const handleSaveRecipient = async (data: { name: string; relationship?: string; budgetLimit?: number }) => {
    if (!user) return;
    if (editingRecipient) {
      await updateChristmasRecipient(editingRecipient.id, data);
    } else {
      await addChristmasRecipient(user.uid, data);
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (confirm('Opravdu chcete odebrat tuto osobu a všechny její dárky?')) {
      await deleteChristmasRecipient(id);
    }
  };

  // Gift Handlers
  const handleOpenAddGift = (recipientId: string) => {
    setTargetRecipientId(recipientId);
    setEditingGift(null);
    setIsGiftModalOpen(true);
  };

  const handleOpenEditGift = (recipientId: string, gift: GiftIdea) => {
    setTargetRecipientId(recipientId);
    setEditingGift(gift);
    setIsGiftModalOpen(true);
  };

  const handleSaveGift = async (data: Omit<GiftIdea, 'id' | 'createdAt'>) => {
    if (!targetRecipientId) return;
    if (editingGift) {
      await updateGiftInRecipient(targetRecipientId, editingGift.id, data);
    } else {
      await addGiftToRecipient(targetRecipientId, data);
    }
  };

  const handleDeleteGift = async (recipientId: string, giftId: string) => {
    if (confirm('Opravdu chcete smazat tento dárek?')) {
      await deleteGiftFromRecipient(recipientId, giftId);
    }
  };

  const handleUpdateGiftStatus = async (recipientId: string, giftId: string, nextStatus: GiftStatus) => {
    await updateGiftInRecipient(recipientId, giftId, { status: nextStatus });
  };

  // Target recipient name for modal
  const currentTargetRecipient = recipients.find((r) => r.id === targetRecipientId);

  // Filtered recipients
  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.relationship && r.relationship.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.gifts || []).some((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'UNFINISHED') {
      // Still has unbought gifts or 0 gifts
      const gifts = r.gifts || [];
      return gifts.length === 0 || gifts.some((g) => g.status === 'IDEA');
    }
    if (filterStatus === 'READY') {
      // All gifts are at least purchased or wrapped or delivered
      const gifts = r.gifts || [];
      return gifts.length > 0 && gifts.every((g) => ['PURCHASED', 'WRAPPED', 'DELIVERED'].includes(g.status));
    }
    return true;
  });

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212A31]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#124E66]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#212A31] text-[#D3D9D4] relative">
      <Navbar />
      <SnowfallEffect />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Banner with festive corner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#D3D9D4] tracking-tight">
                Vánoční centrum
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#124E66] text-[#D3D9D4] border border-[#748D92]/30">
                2026
              </span>
            </div>
            <p className="mt-1 text-sm text-[#748D92]">
              Váš klidný přehled vánočních dárků, rozpočtu a osobních přání
            </p>
          </div>

          <FestiveCornerAccent />
        </div>

        {/* Global Stats & Countdown Banner */}
        <ChristmasStats
          recipients={recipients}
          privacyMode={privacyMode}
          onTogglePrivacy={handleTogglePrivacy}
        />

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-[#748D92]/20 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('RECIPIENTS')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 border ${
                activeTab === 'RECIPIENTS'
                  ? 'bg-[#124E66] border-[#124E66] text-[#D3D9D4] shadow'
                  : 'bg-[#2E3944] border-transparent text-[#748D92] hover:text-[#D3D9D4]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Dárky pro blízké ({recipients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('WISHLIST')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 border ${
                activeTab === 'WISHLIST'
                  ? 'bg-[#124E66] border-[#124E66] text-[#D3D9D4] shadow'
                  : 'bg-[#2E3944] border-transparent text-[#748D92] hover:text-[#D3D9D4]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Můj osobní wishlist ({wishlist.length})</span>
            </button>
          </div>

          {activeTab === 'RECIPIENTS' && (
            <button
              onClick={handleOpenAddRecipient}
              className="px-4 py-2 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs sm:text-sm font-semibold flex items-center gap-2 transition border border-[#748D92]/30 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat člověka</span>
            </button>
          )}
        </div>

        {/* Content by active tab */}
        {activeTab === 'RECIPIENTS' ? (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#2E3944]/50 p-3 rounded-2xl border border-[#748D92]/20">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#748D92]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat podle jména nebo dárku..."
                  className="w-full bg-[#212A31] border border-[#748D92]/30 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#D3D9D4] placeholder-[#748D92]/60 focus:outline-none focus:border-[#124E66] transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
                <span className="text-[#748D92] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filtr:
                </span>
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    filterStatus === 'ALL'
                      ? 'bg-[#124E66] border-[#124E66] text-[#D3D9D4]'
                      : 'bg-[#212A31] border-[#748D92]/30 text-[#748D92] hover:text-[#D3D9D4]'
                  }`}
                >
                  Všichni ({recipients.length})
                </button>
                <button
                  onClick={() => setFilterStatus('UNFINISHED')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    filterStatus === 'UNFINISHED'
                      ? 'bg-[#124E66] border-[#124E66] text-[#D3D9D4]'
                      : 'bg-[#212A31] border-[#748D92]/30 text-[#748D92] hover:text-[#D3D9D4]'
                  }`}
                >
                  Zbývá vyřešit
                </button>
                <button
                  onClick={() => setFilterStatus('READY')}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    filterStatus === 'READY'
                      ? 'bg-[#124E66] border-[#124E66] text-[#D3D9D4]'
                      : 'bg-[#212A31] border-[#748D92]/30 text-[#748D92] hover:text-[#D3D9D4]'
                  }`}
                >
                  Hotovo
                </button>
              </div>
            </div>

            {/* Recipients Cards Grid */}
            {filteredRecipients.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-[#2E3944]/50 border border-dashed border-[#748D92]/30">
                <Users className="w-12 h-12 text-[#748D92] mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[#D3D9D4]">
                  {searchQuery ? 'Žádné shody pro váš filtr' : 'Zatím jste nepřidali žádné lidi'}
                </h3>
                <p className="text-xs text-[#748D92] mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Zkuste upravit hledaný výraz nebo filtr.'
                    : 'Začněte přidáním rodiny, přátel nebo kolegů, pro které plánujete dárky.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleOpenAddRecipient}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#124E66] hover:bg-[#124E66]/80 text-[#D3D9D4] text-xs font-semibold inline-flex items-center gap-1.5 transition border border-[#748D92]/30 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Přidat prvního člověka
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipients.map((recipient) => (
                  <RecipientCard
                    key={recipient.id}
                    recipient={recipient}
                    privacyMode={privacyMode}
                    onAddGift={() => handleOpenAddGift(recipient.id)}
                    onEditRecipient={() => handleOpenEditRecipient(recipient)}
                    onDeleteRecipient={() => handleDeleteRecipient(recipient.id)}
                    onEditGift={(gift) => handleOpenEditGift(recipient.id, gift)}
                    onDeleteGift={(giftId) => handleDeleteGift(recipient.id, giftId)}
                    onUpdateGiftStatus={(giftId, nextStatus) =>
                      handleUpdateGiftStatus(recipient.id, giftId, nextStatus)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <WishlistSection
            items={wishlist}
            onAddItem={async (data) => {
              if (user) await addWishlistItem(user.uid, data);
            }}
            onUpdateItem={async (id, data) => {
              await updateWishlistItem(id, data);
            }}
            onDeleteItem={async (id) => {
              if (confirm('Opravdu chcete smazat tuto položku z wishlistu?')) {
                await deleteWishlistItem(id);
              }
            }}
          />
        )}
      </main>

      {/* Recipient Modal */}
      <RecipientModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        onSubmit={handleSaveRecipient}
        initialData={editingRecipient}
      />

      {/* Gift Modal */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        onSubmit={handleSaveGift}
        initialData={editingGift}
        recipientName={currentTargetRecipient?.name || 'Obdarovaný'}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ScheduleEvent, EventCategory } from '@/types';
import { CATEGORY_CONFIG, CZECH_DAYS } from './plannerConstants';
import {
  Sparkles,
  X,
  Bot,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCw,
  Key,
  HelpCircle,
  Award
} from 'lucide-react';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvents: ScheduleEvent[];
  onApplyPlan: (events: Array<Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
}

export function AiPlannerModal({
  isOpen,
  onClose,
  currentEvents,
  onApplyPlan
}: AiPlannerModalProps) {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Výsledný návrh od AI
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [suggestedMilestones, setSuggestedMilestones] = useState<Array<{ title: string; date: string; notes?: string }>>([]);
  const [suggestedEvents, setSuggestedEvents] = useState<Array<Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>>([]);
  const [applying, setApplying] = useState(false);

  // Rychlé vzorové prompty
  const samplePrompts = [
    {
      title: '🎓 Maturitní plán (Matika + ČJ)',
      text: 'Připravuji se na maturitu z matematiky a českého jazyka. Mám čas v pondělí a ve čtvrtek odpoledne. V úterý mám od 17:00 florbal a v pátek chci mít klid. Rozvrhni mi to efektivně.'
    },
    {
      title: '📝 SCIO testy OSP',
      text: 'Za měsíc píšu SCIO testy OSP. Potřebuji intenzivní přípravu 3x týdně po 1 hodině na analytický a verbální oddíl.'
    },
    {
      title: '⚖️ Balanc škola, sport a volno',
      text: 'Chci týdenní rozvrh, kde budu mít 4 studijní bloky týdně, 3x sportovní trénink a celou neděli vyhrazenou na volno a odpočinek.'
    }
  ];

  const handleGenerate = async (textToUse?: string) => {
    const text = textToUse || prompt;
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setWarning(null);

      const res = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentEvents: currentEvents.map(e => ({
            title: e.title,
            category: e.category,
            startTime: e.startTime,
            endTime: e.endTime,
            daysOfWeek: e.daysOfWeek,
            date: e.date,
            recurrence: e.recurrence
          })),
          customApiKey: apiKey.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generování selhalo');
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      setPlanSummary(data.plan.summary);
      setSuggestedMilestones(data.plan.milestones || []);
      setSuggestedEvents(data.plan.events || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Chyba při komunikaci s AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      // Převedeme i milníky s datem jako zkoušky do událostí (pokud tam již nejsou)
      const allEventsToInsert: Array<Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [...suggestedEvents];
      
      // Doplnění userId řeší rodič
      await onApplyPlan(allEventsToInsert);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Chyba při ukládání navržených událostí: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#212A31] border border-[#2E3944] rounded-2xl w-full max-w-2xl my-6 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2E3944] flex items-center justify-between shrink-0 bg-[#212A31]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#D3D9D4]">AI Asistent rozvrhu & studijního plánu</h2>
              <p className="text-xs text-[#748D92]">Napiš přirozeným jazykem a AI ti sestaví optimální plán</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#748D92] hover:text-white hover:bg-[#2E3944] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upozornění / API Klíč */}
          <div className="bg-[#2E3944]/50 border border-[#748D92]/20 rounded-xl p-3 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#748D92] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                Poháněno Google Gemini. Funguje automaticky nebo s vlastním klíčem.
              </span>
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-[#D3D9D4] hover:underline flex items-center gap-1 text-[11px]"
              >
                <Key className="w-3 h-3" />
                {showKeyInput ? 'Skrýt klíč' : 'Vlastní API klíč'}
              </button>
            </div>
            {showKeyInput && (
              <div className="pt-2 border-t border-[#748D92]/20">
                <input
                  type="password"
                  placeholder="Vlož svůj Google Gemini API klíč (volitelné)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#212A31] border border-[#748D92]/30 text-xs text-[#D3D9D4] focus:outline-none focus:border-[#124E66]"
                />
              </div>
            )}
          </div>

          {/* Rychlé šablony */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#748D92] block mb-2">
              Rychlé předpřipravené šablony:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(s.text);
                    handleGenerate(s.text);
                  }}
                  className="p-2.5 rounded-xl bg-[#2E3944]/60 hover:bg-[#2E3944] border border-[#748D92]/20 text-left transition group"
                >
                  <p className="text-xs font-semibold text-[#D3D9D4] group-hover:text-emerald-300 transition">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-[#748D92] line-clamp-2 mt-1 leading-relaxed">
                    {s.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#748D92] mb-1.5">
              Co potřebuješ naplánovat?
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Např. Připravuji se na maturitu z matematiky, v pondělí a středu mám od 18h trénink, chci se učit hlavně o víkendu a ve čtvrtek..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#2E3944] border border-[#748D92]/30 text-[#D3D9D4] text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Přemýšlím...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Navrhnout rozvrh</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chyba nebo varování */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs">
              {error}
            </div>
          )}
          {warning && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs">
              {warning}
            </div>
          )}

          {/* Náhled navrženého plánu */}
          {planSummary && (
            <div className="border border-emerald-500/30 rounded-2xl bg-emerald-950/10 p-4 space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Návrh rozvrhu od AI
                </h3>
                <p className="text-xs text-[#D3D9D4] mt-1 leading-relaxed">{planSummary}</p>
              </div>

              {/* Milníky */}
              {suggestedMilestones.length > 0 && (
                <div className="bg-[#212A31]/80 rounded-xl p-3 border border-[#2E3944]">
                  <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5" />
                    Klíčové zkoušky & milníky:
                  </span>
                  <div className="space-y-1.5">
                    {suggestedMilestones.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#2E3944]/40">
                        <span className="font-semibold text-white">{m.title}</span>
                        <span className="text-rose-400 font-mono text-[11px]">{m.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seznam navržených bloků */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#748D92] uppercase tracking-wider block">
                  Navržené aktivity k zapsání ({suggestedEvents.length}):
                </span>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {suggestedEvents.map((evt, idx) => {
                    const cat = CATEGORY_CONFIG[evt.category as EventCategory] || CATEGORY_CONFIG.STUDY;
                    const Icon = cat.icon;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border ${cat.bg} ${cat.border} flex items-center justify-between gap-3 text-xs`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${cat.text}`} />
                          <div className="truncate">
                            <p className="font-semibold text-white truncate">{evt.title}</p>
                            {evt.description && (
                              <p className="text-[11px] text-[#748D92] truncate">{evt.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {evt.recurrence === 'WEEKLY' && evt.daysOfWeek ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#2E3944] text-[#D3D9D4] flex items-center gap-1">
                              <RotateCw className="w-3 h-3 text-[#124E66]" />
                              {evt.daysOfWeek.map(d => CZECH_DAYS.find(c => c.id === d)?.short).join(', ')}
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#2E3944] text-[#D3D9D4] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-rose-400" />
                              {evt.date || 'Jednorázová'}
                            </span>
                          )}

                          <span className="font-mono text-[11px] text-[#D3D9D4] bg-black/30 px-2 py-0.5 rounded-md">
                            {evt.startTime} - {evt.endTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tlačítko aplikovat */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying || suggestedEvents.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{applying ? 'Zapisuji do kalendáře...' : `Aplikovat celý plán (${suggestedEvents.length} aktivit)`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

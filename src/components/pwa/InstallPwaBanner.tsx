'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone (installed) mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const dismissedUntil = localStorage.getItem('taskflow_pwa_dismissed');
    const isTemporarilyDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

    if (isRunningStandalone || isTemporarilyDismissed) {
      setIsDismissed(true);
      return;
    }

    // For Android / Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari (show banner once if not installed)
    if (isIosDevice && !isRunningStandalone && !isTemporarilyDismissed) {
      setIsDismissed(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIOSGuide(false);
    // Dismiss for 7 days
    localStorage.setItem('taskflow_pwa_dismissed', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#2E3944] border border-[#748D92]/40 rounded-2xl p-4 shadow-2xl backdrop-blur animate-slide-up text-[#D3D9D4]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#124E66] flex items-center justify-center shrink-0 border border-[#748D92]/30 shadow">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Nainstalovat TaskFlow</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PWA
                </span>
              </h4>
              <p className="text-xs text-[#748D92] mt-0.5">
                Používejte aplikaci jako na mobilu – rychlý přístup z plochy i offline.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-[#748D92] hover:text-white rounded-lg hover:bg-[#212A31] transition"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-[#748D92]/20 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#748D92] hover:text-white hover:bg-[#212A31] transition"
          >
            Později
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#124E66] hover:bg-[#124E66]/80 text-white flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Nainstalovat</span>
          </button>
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#212A31] border border-[#2E3944] rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#124E66] mx-auto flex items-center justify-center text-emerald-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instalace na iPhone / iPad</h3>
              <p className="text-xs text-[#748D92] mt-1">
                V prohlížeči Safari klepněte dole na tlačítko <strong>Sdílet (Share)</strong> a poté vyberte <strong>„Přidat na plochu“</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#124E66] text-white text-xs font-bold hover:bg-[#124E66]/80 transition"
            >
              Rozumím
            </button>
          </div>
        </div>
      )}
    </>
  );
}

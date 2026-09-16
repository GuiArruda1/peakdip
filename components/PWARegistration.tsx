'use client';

import { useEffect, useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.');

    // ─── IN DEVELOPMENT: PURGE SERVICE WORKER & ALL CACHES FOR INSTANT LIVE HMR ───
    if (isLocalhost) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log('⚡ [DEV] ServiceWorker unregistered to enable instant live reloading.');
        }
      });

      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    // ─── IN PRODUCTION: REGISTER WITH AUTO-UPDATE LISTENER ───
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Automatically check for updates on navigation
        reg.update().catch(() => {});
        console.log('PWA Service Worker active with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration failed:', err);
      });

    // Automatically reload when new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Listen for standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-md">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA Installed</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-mono text-emerald-300 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/40 hover:border-emerald-400 rounded-lg transition-all shadow-sm"
      title="Install PEAK Dip Hunter as a standalone desktop or mobile application"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
      <span>Install PWA</span>
    </button>
  );
}

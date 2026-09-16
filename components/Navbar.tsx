'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Zap, 
  Home, 
  Brain, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bell, 
  ExternalLink,
  Sliders,
  ChevronDown
} from 'lucide-react';
import PWARegistration from './PWARegistration';
import NotificationSettingsModal from './NotificationSettingsModal';

interface NavbarProps {
  selectedAsset: 'BTCUSDT' | 'SPY';
  onSelectAsset: (asset: 'BTCUSDT' | 'SPY') => void;
  currentPrice: number;
  priceChange24h: number;
  onSync: () => void;
  isSyncing: boolean;
  lastUpdated?: string;
  mode?: 'swing' | 'daytrade' | 'defcon';
  onModeChange?: (mode: 'swing' | 'daytrade' | 'defcon') => void;
}

export default function Navbar({
  selectedAsset,
  onSelectAsset,
  currentPrice,
  priceChange24h,
  onSync,
  isSyncing,
  lastUpdated,
  mode = 'swing',
  onModeChange,
}: NavbarProps) {
  const isBtc = selectedAsset === 'BTCUSDT';
  const isPositive = priceChange24h >= 0;

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'light' : 'dark');
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    try {
      localStorage.setItem('peak_theme', nextTheme);
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#121418]/95 backdrop-blur-xl shadow-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* ─── LEFT: BRAND LOGO ─── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group" title="Return to PeakDip Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-b from-[#2a2d36] to-[#181920] border border-white/10 border-t-white/25 shadow-lg shadow-black/60 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-base sm:text-lg tracking-wider text-white">
                    PEAK<span className="text-[#f5e098] font-light ml-0.5">DIP</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-full shadow-sm">
                    v2.4
                  </span>
                </div>
                <p className="hidden md:block text-[9px] text-slate-400 tracking-wide font-medium">
                  QUANTITATIVE TIMING
                </p>
              </div>
            </Link>
          </div>

          {/* ─── CENTER: DESKTOP ENGINE SWITCHER & HUBS (Hidden on < lg) ─── */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            
            {/* Primary Engine Switcher: Swing vs Day vs DEFCON */}
            <div className="flex items-center bg-[#0e0f13] p-1 rounded-full border border-white/[0.05] shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)] gap-0.5 font-mono text-xs">
              <button
                onClick={() => onModeChange?.('swing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
                  mode === 'swing'
                    ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-white shadow-md border-t border-white/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌊 Swing</span>
              </button>

              <button
                onClick={() => onModeChange?.('daytrade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
                  mode === 'daytrade'
                    ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-amber-300 shadow-md border-t border-white/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>⚡ Day</span>
              </button>

              <button
                onClick={() => onModeChange?.('defcon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
                  mode === 'defcon'
                    ? 'bg-gradient-to-b from-[#3a1d22] to-[#251316] text-rose-300 shadow-md border-t border-rose-500/30'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>DEFCON</span>
              </button>
            </div>

            {/* Asset Switcher (when in Swing mode) */}
            {mode === 'swing' && (
              <div className="flex items-center bg-[#0e0f13] p-1 rounded-full border border-white/[0.05] shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)] gap-0.5 font-mono text-xs">
                <button
                  onClick={() => onSelectAsset('BTCUSDT')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all ${
                    isBtc
                      ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-white shadow-md border-t border-white/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>BTC</span>
                </button>

                <button
                  onClick={() => onSelectAsset('SPY')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all ${
                    !isBtc
                      ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-white shadow-md border-t border-white/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3 text-blue-400" />
                  <span>SPY</span>
                </button>
              </div>
            )}

            {/* Navigation Hubs Group */}
            <div className="flex items-center bg-[#0e0f13] p-1 rounded-full border border-white/[0.05] shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)] gap-0.5 font-mono text-xs">
              <Link
                href="/quantfury"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-emerald-300 hover:text-white hover:bg-emerald-950/40"
                title="Open Quantfury Execution Hub & Bot Mirror"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quantfury</span>
              </Link>
              <Link
                href="/brain"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-purple-300 hover:text-white hover:bg-purple-950/40"
                title="Open Brain Knowledge Center & Trading Dictionary"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Brain</span>
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-jarvis-briefing'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-cyan-300 hover:text-white hover:bg-cyan-950/40"
                title="Open JARVIS Morning Market Briefing & Voice Report"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>JARVIS</span>
              </button>
            </div>
          </div>

          {/* ─── RIGHT: LIVE PRICE TICKER & QUICK ACTIONS ─── */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Price Tag (Compact & Responsive) */}
            {currentPrice > 0 && (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-[#0e0f13] border border-white/[0.05] rounded-xl sm:rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col items-start">
                  <span className="text-[8px] sm:text-[9px] uppercase font-mono tracking-wider text-slate-400">
                    {isBtc ? 'BTC' : 'SPY'}
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-tight">
                    ${currentPrice >= 1000 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : currentPrice.toFixed(2)}
                  </span>
                </div>
                <span
                  className={`font-mono text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full ${
                    isPositive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {priceChange24h.toFixed(1)}%
                </span>
              </div>
            )}

            {/* Desktop Action Icons Cluster */}
            <div className="hidden sm:flex items-center gap-1.5">
              {/* Notification Settings */}
              <div className="relative">
                <NotificationSettingsModal />
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="tactile-squircle p-2 text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle light/dark theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#f5e098] hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* PWA Install Button */}
              <PWARegistration />

              {/* Manual Sync Button */}
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="tactile-squircle flex items-center gap-1 px-3 py-2 text-xs font-mono font-medium text-slate-300 disabled:opacity-50"
                title="Sync latest market data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden xl:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>

            {/* ─── MOBILE / TABLET MENU TOGGLE BUTTON (Visible on < lg) ─── */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden tactile-squircle p-2 text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE / TABLET SLIDE-DOWN NAVIGATION DRAWER ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#0c0e14]/98 backdrop-blur-2xl px-4 py-5 space-y-5 animate-in slide-in-from-top-3 duration-200 shadow-2xl font-mono text-xs">
          
          {/* 1. Trading Engine Mode Selector */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              TRADING ENGINE MODE:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onModeChange?.('swing');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  mode === 'swing'
                    ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-emerald-300 border-emerald-500/50 shadow-md font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-sm">🌊</span>
                <span>Swing</span>
              </button>

              <button
                onClick={() => {
                  onModeChange?.('daytrade');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  mode === 'daytrade'
                    ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-amber-300 border-amber-500/50 shadow-md font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Day Trade</span>
              </button>

              <button
                onClick={() => {
                  onModeChange?.('defcon');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  mode === 'defcon'
                    ? 'bg-gradient-to-b from-[#3a1d22] to-[#251316] text-rose-300 border-rose-500/50 shadow-md font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>DEFCON</span>
              </button>
            </div>
          </div>

          {/* 2. Asset Selector (when in swing mode) */}
          {mode === 'swing' && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                ACTIVE ASSET:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSelectAsset('BTCUSDT');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    isBtc
                      ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-amber-300 border-amber-500/40 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Bitcoin (BTC)</span>
                </button>

                <button
                  onClick={() => {
                    onSelectAsset('SPY');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    !isBtc
                      ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-blue-300 border-blue-500/40 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>S&P 500 (SPY)</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Navigation Hubs */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              INTELLIGENCE HUBS & APPS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link
                href="/quantfury"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Quantfury Hub</span>
                    <span className="text-[9px] text-slate-400">Zero-fee mirror bot</span>
                  </div>
                </div>
                <span className="text-slate-500 text-xs">→</span>
              </Link>

              <Link
                href="/brain"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-600/50 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Brain Academy</span>
                    <span className="text-[9px] text-slate-400">Glossary & rules</span>
                  </div>
                </div>
                <span className="text-slate-500 text-xs">→</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-jarvis-briefing'));
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-600/50 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">JARVIS Voice</span>
                    <span className="text-[9px] text-slate-400">Morning briefing</span>
                  </div>
                </div>
                <span className="text-slate-500 text-xs">→</span>
              </button>
            </div>
          </div>

          {/* 4. Utilities Row (Theme, Alerts, Sync) */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 font-semibold"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#f5e098]" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onSync();
                setMobileMenuOpen(false);
              }}
              disabled={isSyncing}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Market'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}


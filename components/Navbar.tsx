'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, RefreshCw, Layers, TrendingUp, Zap, Home, Brain, Sun, Moon } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#121418]/90 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Links to Home /) */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group" title="Return to PeakDip Home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#2a2d36] to-[#181920] border border-white/10 border-t-white/25 shadow-lg shadow-black/60 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg tracking-wider text-white">
                  PEAK<span className="text-[#f5e098] font-light ml-1">DIP</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-full shadow-sm">
                  ML-v2.4
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 tracking-wide font-medium">
                QUANTITATIVE TIMING INTELLIGENCE
              </p>
            </div>
          </Link>

          {/* Mode Switcher: Swing Hunter vs Day Trade Scalper vs DEFCON Radar (Desktop) */}
          <div className="hidden md:flex items-center bg-[#0e0f13] p-1 rounded-full border border-white/[0.05] shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)] gap-0.5">
            <button
              onClick={() => onModeChange?.('swing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                mode === 'swing'
                  ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-white shadow-md border-t border-white/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🌊 Swing</span>
            </button>
            <button
              onClick={() => onModeChange?.('daytrade')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                mode === 'defcon'
                  ? 'bg-gradient-to-b from-[#3a1d22] to-[#251316] text-rose-300 shadow-md border-t border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>DEFCON</span>
            </button>
            <Link
              href="/quantfury"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all text-emerald-300 hover:text-white hover:bg-emerald-950/30"
              title="Open Quantfury Execution Hub & Bot Mirror"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quantfury</span>
            </Link>
            <Link
              href="/brain"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all text-purple-300 hover:text-white hover:bg-purple-950/30"
              title="Open Brain Knowledge Center & Trading Dictionary"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Brain</span>
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-jarvis-briefing'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all text-cyan-300 hover:text-white hover:bg-cyan-950/30"
              title="Open JARVIS Morning Market Briefing & Voice Report"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>JARVIS</span>
            </button>
          </div>

          {/* Asset Switcher (Visible in Swing Mode) */}
          {mode === 'swing' && (
            <div className="flex items-center bg-[#0e0f13] p-1 rounded-full border border-white/[0.05] shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)] gap-0.5">
              <button
                onClick={() => onSelectAsset('BTCUSDT')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ${
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

          {/* Right Side: Live Price Ticker & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Price Tag (Shakuro Inset Well & Gold Tag) */}
            {currentPrice > 0 && (
              <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-[#0e0f13] border border-white/[0.05] rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col items-start">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">
                    {isBtc ? 'BTC/USDT' : 'SPY ETF'}
                  </span>
                  <span className="font-mono text-sm font-bold text-white tracking-tight">
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isPositive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {priceChange24h.toFixed(2)}%
                </span>
              </div>
            )}

            {/* Notification & Alerts Button (with Shakuro amber indicator) */}
            <div className="relative">
              <NotificationSettingsModal />
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
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

            {/* Manual Sync Button (Tactile Squircle) */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="tactile-squircle flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-slate-300 disabled:opacity-50"
              title="Sync latest market data & recalculate analytical triggers"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, RefreshCw, Layers, TrendingUp, Zap, Home, Brain } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080B11]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Links to Home /) */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group" title="Return to PeakDip Home">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-[1px] shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F17] rounded-[7px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg tracking-wider text-white">
                  PEAK<span className="text-emerald-400 font-light ml-1">DIP</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 rounded">
                  ML-v2.4
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
                S&P 500 & Crypto Market Timing Intelligence
              </p>
            </div>
          </Link>

          {/* Mode Switcher: Swing Hunter vs Day Trade Scalper vs DEFCON Radar (Desktop) */}
          <div className="hidden md:flex items-center bg-[#070A10] p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => onModeChange?.('swing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'swing'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>🌊 Swing</span>
            </button>
            <button
              onClick={() => onModeChange?.('daytrade')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'daytrade'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>⚡ Day Trade</span>
            </button>
            <button
              onClick={() => onModeChange?.('defcon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'defcon'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🛰️ DEFCON War</span>
            </button>
            <Link
              href="/quantfury"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/30 shadow-sm shadow-emerald-950/40"
              title="Open Quantfury Execution Hub & Bot Mirror"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>⚡ Quantfury</span>
            </Link>
            <Link
              href="/brain"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20"
              title="Open Brain Knowledge Center & Trading Dictionary"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>🧠 Brain</span>
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-jarvis-briefing'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/30 shadow-sm shadow-cyan-950/40"
              title="Open JARVIS Morning Market Briefing & Voice Report"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>🤖 JARVIS</span>
            </button>
          </div>

          {/* Asset Switcher (Visible in Swing Mode) */}
          {mode === 'swing' && (
            <div className="flex items-center bg-[#0F1420] p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => onSelectAsset('BTCUSDT')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  isBtc
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>BTC</span>
              </button>

              <button
                onClick={() => onSelectAsset('SPY')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  !isBtc
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>SPY</span>
              </button>
            </div>
          )}

          {/* Right Side: Live Price Ticker & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Price Tag */}
            {currentPrice > 0 && (
              <div className="hidden md:flex flex-col items-end px-3 py-1 bg-[#0F1420] border border-slate-800/80 rounded-lg">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  {isBtc ? 'BTC/USDT SPOT' : 'SPY ETF CLOSE'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-white">
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Hourly Email Notifications Button & Modal */}
            <NotificationSettingsModal />

            {/* PWA Install Button */}
            <PWARegistration />

            {/* Manual Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-[#0F1420] hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 rounded-lg transition-all disabled:opacity-50"
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

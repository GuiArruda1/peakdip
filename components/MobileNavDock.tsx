'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Zap, ShieldAlert, MessageSquare, ExternalLink, Activity } from 'lucide-react';

interface MobileNavDockProps {
  activeMode: 'swing' | 'daytrade' | 'defcon';
  onModeChange: (mode: 'swing' | 'daytrade' | 'defcon') => void;
  onOpenAlerts: () => void;
  onOpenChat: () => void;
  currentPrice: number;
  priceChange24h: number;
  selectedAsset: 'BTCUSDT' | 'SPY';
}

export default function MobileNavDock({
  activeMode,
  onModeChange,
  onOpenAlerts,
  onOpenChat,
  currentPrice,
  priceChange24h,
  selectedAsset,
}: MobileNavDockProps) {
  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 lg:hidden max-w-lg mx-auto pb-safe">
      <nav 
        aria-label="Mobile Navigation Dock"
        className="bg-[#181a21]/95 backdrop-blur-2xl border border-white/[0.08] border-t-white/[0.2] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] p-1.5 flex items-center justify-between gap-1 select-none font-mono"
      >
        {/* Tab 1: Swing Hunter */}
        <button
          type="button"
          onClick={() => onModeChange('swing')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all focus:outline-none active:scale-95 ${
            activeMode === 'swing'
              ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-emerald-300 shadow-md border-t border-white/25 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">Swing</span>
        </button>

        {/* Tab 2: Day Scalper */}
        <button
          type="button"
          onClick={() => onModeChange('daytrade')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all focus:outline-none active:scale-95 ${
            activeMode === 'daytrade'
              ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-amber-300 shadow-md border-t border-white/25 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">Day</span>
        </button>

        {/* Tab 3: DEFCON Radar */}
        <button
          type="button"
          onClick={() => onModeChange('defcon')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all focus:outline-none active:scale-95 ${
            activeMode === 'defcon'
              ? 'bg-gradient-to-b from-[#3a1d22] to-[#251316] text-rose-300 shadow-md border-t border-rose-500/30 font-bold'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">DEFCON</span>
        </button>

        {/* Tab 4: Quantfury Hub */}
        <Link
          href="/quantfury"
          className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl text-emerald-300 hover:text-white transition-all focus:outline-none active:scale-95 hover:bg-emerald-950/30"
          title="Open Quantfury Execution Hub"
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase font-bold">Quantfury</span>
        </Link>

        {/* Tab 5: AI Live Copilot */}
        <button
          type="button"
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl text-cyan-300 hover:text-white transition-all focus:outline-none active:scale-95 hover:bg-cyan-950/30"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase font-bold">Copilot</span>
        </button>
      </nav>
    </div>
  );
}


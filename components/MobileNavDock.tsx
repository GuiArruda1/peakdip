'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Zap, Bell, MessageSquare, Brain } from 'lucide-react';

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
  const isPositive = priceChange24h >= 0;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 sm:hidden max-w-md mx-auto pb-safe">
      <nav 
        aria-label="Mobile Navigation Dock"
        className="bg-[#181a21]/92 backdrop-blur-2xl border border-white/[0.08] border-t-white/[0.2] rounded-full shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] p-1.5 flex items-center justify-between gap-1 select-none"
      >
        {/* Tab 1: Swing Hunter */}
        <button
          type="button"
          onClick={() => onModeChange('swing')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-full transition-all focus:outline-none active:scale-95 ${
            activeMode === 'swing'
              ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-emerald-300 shadow-md border-t border-white/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[8px] font-mono mt-0.5 tracking-wider uppercase font-bold">Swing</span>
        </button>

        {/* Tab 2: Day Trade */}
        <button
          type="button"
          onClick={() => onModeChange('daytrade')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-full transition-all focus:outline-none active:scale-95 ${
            activeMode === 'daytrade'
              ? 'bg-gradient-to-b from-[#2e3039] to-[#1e2027] text-amber-300 shadow-md border-t border-white/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[8px] font-mono mt-0.5 tracking-wider uppercase font-bold">Day</span>
        </button>

        {/* Center Tactile Toggle / Ticker Widget (Shakuro Embossed Switch) */}
        {currentPrice > 0 ? (
          <div className="flex flex-col items-center justify-center px-2.5 py-1 bg-[#0e0f13] border border-white/[0.06] rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] shrink-0 min-w-[70px]">
            <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">
              {selectedAsset.replace('USDT', '')}
            </span>
            <span className="text-[10px] font-mono font-bold text-white leading-tight">
              ${currentPrice >= 1000 ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : currentPrice.toFixed(2)}
            </span>
            <span className={`text-[8px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{priceChange24h.toFixed(1)}%
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onModeChange('defcon')}
            className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-full transition-all ${
              activeMode === 'defcon'
                ? 'bg-gradient-to-b from-[#3a1d22] to-[#251316] text-rose-300 border-t border-rose-500/30'
                : 'text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[8px] font-mono mt-0.5 uppercase">DEFCON</span>
          </button>
        )}

        {/* Tab 3: Alerts with Shakuro Amber Counter */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-full text-slate-400 hover:text-white transition-all relative focus:outline-none active:scale-95"
        >
          <div className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
          <span className="text-[8px] font-mono mt-0.5 tracking-wider uppercase font-bold">Alerts</span>
        </button>

        {/* Tab 4: AI Copilot */}
        <button
          type="button"
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-full text-slate-400 hover:text-white transition-all focus:outline-none active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="text-[8px] font-mono mt-0.5 tracking-wider uppercase font-bold">Copilot</span>
        </button>

        {/* Tab 5: Brain */}
        <Link
          href="/brain"
          className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-full text-purple-300 hover:text-white transition-all focus:outline-none active:scale-95"
        >
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-[8px] font-mono mt-0.5 tracking-wider uppercase font-bold">Brain</span>
        </Link>
      </nav>
    </div>
  );
}

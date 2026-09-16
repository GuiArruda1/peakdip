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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B11]/95 backdrop-blur-xl border-t border-slate-800/90 pb-safe sm:hidden shadow-2xl w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between px-1.5 py-1.5 w-full max-w-md mx-auto">
        {/* Tab 1: Swing Hunter */}
        <button
          type="button"
          onClick={() => onModeChange('swing')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all focus:outline-none active:scale-95 select-none ${
            activeMode === 'swing'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              activeMode === 'swing' ? 'bg-emerald-500/20 text-emerald-300' : ''
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 tracking-tight truncate">Swing</span>
        </button>

        {/* Tab 2: Day Trade */}
        <button
          type="button"
          onClick={() => onModeChange('daytrade')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all focus:outline-none active:scale-95 select-none relative ${
            activeMode === 'daytrade'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              activeMode === 'daytrade' ? 'bg-amber-500/20 text-amber-300' : ''
            }`}
          >
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 tracking-tight truncate">Day</span>
        </button>

        {/* Tab 3: DEFCON War Radar */}
        <button
          type="button"
          onClick={() => onModeChange('defcon')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all focus:outline-none active:scale-95 select-none relative ${
            activeMode === 'defcon'
              ? 'text-rose-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              activeMode === 'defcon' ? 'bg-rose-500/20 text-rose-300' : ''
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse block mx-auto my-0.5" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 tracking-tight truncate">DEFCON</span>
        </button>

        {/* Center Quick Ticker Pill */}
        {currentPrice > 0 && (
          <div className="flex flex-col items-center justify-center px-1.5 py-0.5 bg-[#0F1420] border border-slate-800 rounded-xl font-mono text-center shrink-0 min-w-[64px]">
            <span className="text-[8px] text-slate-400 uppercase font-semibold">
              {selectedAsset.replace('USDT', '')}
            </span>
            <span className="text-[10px] font-bold text-white leading-none mt-0.5">
              ${currentPrice >= 1000 ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : currentPrice.toFixed(2)}
            </span>
            <span className={`text-[8px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{priceChange24h.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Tab 3: Alerts & Notifications */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl text-slate-400 hover:text-white transition-all focus:outline-none active:scale-95 select-none"
        >
          <div className="p-1 rounded-lg hover:bg-slate-800/60">
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 tracking-tight truncate">Alerts</span>
        </button>

        {/* Tab 4: AI Copilot */}
        <button
          type="button"
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl text-slate-400 hover:text-white transition-all focus:outline-none active:scale-95 select-none"
        >
          <div className="p-1 rounded-lg hover:bg-slate-800/60 text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 tracking-tight truncate">Copilot</span>
        </button>

        {/* Tab 5: Brain Codex */}
        <Link
          href="/brain"
          className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl text-purple-300 hover:text-white transition-all focus:outline-none active:scale-95 select-none"
        >
          <div className="p-1 rounded-lg hover:bg-purple-950/40 text-purple-400">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 tracking-tight truncate">Brain</span>
        </Link>
      </div>
    </div>
  );
}

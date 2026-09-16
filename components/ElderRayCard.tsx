'use client';

import React from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { ElderRayData, TripleScreenStatus } from '@/lib/types';

interface ElderRayCardProps {
  elderRay?: ElderRayData;
  tripleScreen?: TripleScreenStatus;
  currentPrice: number;
  symbol: string;
}

export default function ElderRayCard({
  elderRay,
  tripleScreen,
  currentPrice,
  symbol,
}: ElderRayCardProps) {
  if (!elderRay || !tripleScreen) {
    return (
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 text-center text-slate-400 font-mono text-xs">
        Initializing Dr. Alexander Elder Quantitative Engine...
      </div>
    );
  }

  const isBtc = symbol.toUpperCase().includes('BTC');
  const isBullPowerPos = elderRay.bullPower >= 0;
  const isBearPowerPos = elderRay.bearPower >= 0;

  return (
    <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
      {/* ─── CARD HEADER ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#080C14] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white tracking-wider">
                DR. ELDER’S TRIPLE SCREEN & ELDER-RAY
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                Trading for a Living
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-timeframe Tide, Wave & Ripple confluence with Bull/Bear Power oscillators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              tripleScreen.allScreensAligned
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            {tripleScreen.allScreensAligned ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3 SCREENS CONFLUENCE: ARMED</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>CONFLUENCE: {tripleScreen.confluenceScore}%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── BODY GRID ─── */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The 3 Screens Breakdown */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            The Triple Screen Sequence
          </h4>

          {/* Screen 1: Weekly Tide */}
          <div className="p-3.5 rounded-xl bg-[#070A11] border border-slate-800/80 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 border border-blue-600/50 text-blue-300 uppercase">
                  SCREEN 1: THE TIDE (WEEKLY)
                </span>
                <span className="text-[11px] font-mono text-slate-400">13-Week EMA Slope</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{tripleScreen.screen1Tide.verdict}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  tripleScreen.screen1Tide.direction === 'BULLISH'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/60'
                }`}
              >
                {tripleScreen.screen1Tide.direction}
              </span>
            </div>
          </div>

          {/* Screen 2: Daily Wave */}
          <div className="p-3.5 rounded-xl bg-[#070A11] border border-slate-800/80 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 uppercase">
                  SCREEN 2: THE WAVE (DAILY)
                </span>
                <span className="text-[11px] font-mono text-slate-400">Elder-Ray Bear Power & Force</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{tripleScreen.screen2Wave.verdict}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  tripleScreen.screen2Wave.condition === 'OVERSOLD_DIP'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/60'
                }`}
              >
                {tripleScreen.screen2Wave.condition.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Screen 3: Intraday Ripple */}
          <div className="p-3.5 rounded-xl bg-[#070A11] border border-slate-800/80 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 border border-purple-600/50 text-purple-300 uppercase">
                  SCREEN 3: THE RIPPLE (EXECUTION)
                </span>
                <span className="text-[11px] font-mono text-slate-400">Trailing Buy Stop Trigger</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{tripleScreen.screen3Ripple.verdict}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  tripleScreen.screen3Ripple.status === 'ARMED_BUY_STOP'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {tripleScreen.screen3Ripple.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Elder-Ray (Bull/Bear Power) Gauges */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-xl bg-[#070A11] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-2.5">
              <div>
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Elder-Ray Oscillators
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  Reference: 13-EMA @ ${elderRay.ema13.toLocaleString()}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  elderRay.signal === 'STRONG_BUY_DIP'
                    ? 'bg-emerald-600 text-white'
                    : elderRay.signal === 'BUY_DIP'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {elderRay.signal.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Bull Power Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Bull Power (High - 13 EMA):</span>
                <span className={`font-bold ${isBullPowerPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isBullPowerPos ? '+' : ''}${elderRay.bullPower.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all ${isBullPowerPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(15, Math.abs(elderRay.bullPower) / (currentPrice * 0.05) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Measures the maximum capability of buyers to lift price above the consensus 13-EMA.
              </span>
            </div>

            {/* Bear Power Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Bear Power (Low - 13 EMA):</span>
                <span className={`font-bold ${isBearPowerPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isBearPowerPos ? '+' : ''}${elderRay.bearPower.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all ${isBearPowerPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(15, Math.abs(elderRay.bearPower) / (currentPrice * 0.05) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {elderRay.bullishDivergence ? (
                  <span className="text-emerald-400 font-bold">
                    🔥 BULLISH DIVERGENCE: Bear Power formed a higher trough while price tested lows!
                  </span>
                ) : (
                  'Measures the capacity of bears to push price below consensus value.'
                )}
              </span>
            </div>

            {/* 2-Day Force Index */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">2-Day Smoothed Force Index:</span>
              <span className={`font-bold ${elderRay.forceIndex2 < 0 ? 'text-cyan-400' : 'text-slate-300'}`}>
                {elderRay.forceIndex2 < 0 ? '📉 Negative (Dip Entry)' : '📈 Positive (Trend)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

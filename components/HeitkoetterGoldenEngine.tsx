'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Zap,
  Target,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { DayTradeSetup } from '@/lib/types';

interface HeitkoetterGoldenEngineProps {
  currentPrice: number;
  symbol: string;
  activeSetup?: DayTradeSetup | null;
}

const PHI = 1.61803398875; // The Golden Ratio Φ
const PHI_SQ = 2.61803398875; // The Golden Extension Φ²

export default function HeitkoetterGoldenEngine({
  currentPrice,
  symbol,
  activeSetup,
}: HeitkoetterGoldenEngineProps) {
  // ─── 1. REAL-TIME MARKET CLOCK & HEITKOETTER PHASES (US Eastern Time) ───
  const [etTime, setEtTime] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<{
    name: string;
    status: 'GOLDEN_WINDOW' | 'LUNCH_DANGER' | 'OPENING_RUSH' | 'AFTERNOON_TREND' | 'CLOSING_SQUARE' | 'CLOSED';
    guidance: string;
    color: string;
    progressPct: number;
  }>({
    name: 'Calculating...',
    status: 'CLOSED',
    guidance: 'Syncing with New York exchange time...',
    color: 'text-slate-400',
    progressPct: 0,
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format to America/New_York (Eastern Time) & Europe/Lisbon Time
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      const lisbonFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Lisbon',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
      const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);

      const lParts = lisbonFormatter.formatToParts(now);
      const lHour = parseInt(lParts.find((p) => p.type === 'hour')?.value || '0', 10);
      const lMinute = parseInt(lParts.find((p) => p.type === 'minute')?.value || '0', 10);
      const lSecond = parseInt(lParts.find((p) => p.type === 'second')?.value || '0', 10);

      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ET (${String(lHour).padStart(2, '0')}:${String(lMinute).padStart(2, '0')}:${String(lSecond).padStart(2, '0')} Lisbon)`;
      setEtTime(timeString);

      const totalMinutes = hour * 60 + minute;
      const openMinutes = 9 * 60 + 30; // 09:30 AM (570 min)
      const closeMinutes = 16 * 60; // 04:00 PM (960 min)

      if (totalMinutes < openMinutes || totalMinutes >= closeMinutes) {
        setCurrentPhase({
          name: 'Pre/Post Market Session (Closed)',
          status: 'CLOSED',
          guidance: 'Regular US exchange hours are closed (14:30–21:00 Lisbon). Overnight / Crypto liquidity applies.',
          color: 'text-slate-400',
          progressPct: 0,
        });
      } else if (totalMinutes < 10 * 60) {
        // 09:30 - 10:00 (Opening Rush)
        const prog = ((totalMinutes - openMinutes) / 30) * 100;
        setCurrentPhase({
          name: 'The Opening Rush (09:30–10:00 ET / 14:30–15:00 Lisbon)',
          status: 'OPENING_RUSH',
          guidance: 'High initial volatility & trap spikes. Wait for opening range highs and lows to establish.',
          color: 'text-amber-400',
          progressPct: Math.round(prog),
        });
      } else if (totalMinutes < 11 * 60 + 30) {
        // 10:00 - 11:30 (The Golden Window)
        const prog = ((totalMinutes - 10 * 60) / 90) * 100;
        setCurrentPhase({
          name: '✨ The Golden Trading Window (10:00–11:30 ET / 15:00–16:30 Lisbon)',
          status: 'GOLDEN_WINDOW',
          guidance: 'PRIME SESSION: Institutional trend continuity is at its highest statistical win-rate of the day.',
          color: 'text-emerald-400',
          progressPct: Math.round(prog),
        });
      } else if (totalMinutes < 13 * 60 + 30) {
        // 11:30 - 13:30 (Lunchtime Chop Danger Zone)
        const prog = ((totalMinutes - (11 * 60 + 30)) / 120) * 100;
        setCurrentPhase({
          name: '⚠️ Lunchtime Chop Danger Zone (11:30–13:30 ET / 16:30–18:30 Lisbon)',
          status: 'LUNCH_DANGER',
          guidance: 'HEITKOETTER DANGER ZONE: Volume dries up; fakeouts and chop prevail. DO NOT initiate new scalps.',
          color: 'text-rose-400',
          progressPct: Math.round(prog),
        });
      } else if (totalMinutes < 15 * 60 + 15) {
        // 13:30 - 15:15 (Afternoon Trend)
        const prog = ((totalMinutes - (13 * 60 + 30)) / 105) * 100;
        setCurrentPhase({
          name: 'The Afternoon Trend (13:30–15:15 ET / 18:30–20:15 Lisbon)',
          status: 'AFTERNOON_TREND',
          guidance: 'Institutions return from lunch. Look for afternoon trend continuations into key session pivots.',
          color: 'text-cyan-400',
          progressPct: Math.round(prog),
        });
      } else {
        // 15:15 - 16:00 (Closing Squaring-Up)
        const prog = ((totalMinutes - (15 * 60 + 15)) / 45) * 100;
        setCurrentPhase({
          name: 'Market Close Squaring-Up (15:15–16:00 ET / 20:15–21:00 Lisbon)',
          status: 'CLOSING_SQUARE',
          guidance: 'Day traders flatten all open risk. Avoid holding leveraged intraday positions overnight.',
          color: 'text-purple-400',
          progressPct: Math.round(prog),
        });
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── 2. GOLDEN RATIO (Φ = 1.618) BRACKET ORDER CALCULATOR ───
  const isLong = activeSetup ? activeSetup.direction === 'LONG' : true;
  const entry = activeSetup ? activeSetup.entryPrice : currentPrice;
  const rawStop = activeSetup ? activeSetup.stopLoss : Number((currentPrice * 0.992).toFixed(2));
  const riskUnit = Math.max(0.01, Math.abs(entry - rawStop));

  // Golden Ratio Target Scalings
  // Target 1 = 1.000R (Breakeven Scale Out)
  const target1R = isLong ? entry + riskUnit * 1.0 : entry - riskUnit * 1.0;
  // Target 2 = 1.618R (The Golden Target Φ)
  const goldenTarget2R = isLong ? entry + riskUnit * PHI : entry - riskUnit * PHI;
  // Target 3 = 2.618R (The Golden Extension Φ²)
  const goldenExtension3R = isLong ? entry + riskUnit * PHI_SQ : entry - riskUnit * PHI_SQ;

  // Fibonacci Pullback Reload Zones (0.382 and 0.618)
  const fib382 = isLong ? entry - riskUnit * 0.382 : entry + riskUnit * 0.382;
  const fib618 = isLong ? entry - riskUnit * 0.618 : entry + riskUnit * 0.618;

  // ─── 3. HEITKOETTER 3-STRIKE DISCIPLINE CIRCUIT BREAKER ───
  const [strikes, setStrikes] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peak_heitkoetter_strikes');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const recordStrike = () => {
    if (strikes < 3) {
      const updated = strikes + 1;
      setStrikes(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('peak_heitkoetter_strikes', String(updated));
      }
    }
  };

  const resetStrikes = () => {
    setStrikes(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem('peak_heitkoetter_strikes', '0');
    }
  };

  const [copied, setCopied] = useState(false);
  const copyBracketOrder = () => {
    const text = `OCO BRACKET (${symbol}):\nEntry: $${entry}\nStop Loss (1.0R): $${rawStop}\nTP1 (1.000R): $${target1R.toFixed(2)}\nTP2 (Golden 1.618R): $${goldenTarget2R.toFixed(2)}\nTP3 (Golden Ext 2.618R): $${goldenExtension3R.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#090D16] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-5">
      {/* ─── TOP HEADER: HEITKOETTER SESSION CLOCK ─── */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#06080E] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/40 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-white uppercase tracking-wider">
                Heitkoetter Market Session Clock
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                {etTime || 'Live ET'}
              </span>
            </div>
            <div className={`text-xs font-mono font-bold mt-0.5 ${currentPhase.color}`}>
              {currentPhase.name}
            </div>
          </div>
        </div>

        {/* Phase Guidance */}
        <div className="text-left md:text-right max-w-md">
          <span className="text-[11px] text-slate-300 font-medium block">
            {currentPhase.guidance}
          </span>
        </div>
      </div>

      {/* ─── 3-STRIKE CIRCUIT BREAKER BANNER (IF LOCKED) ─── */}
      {strikes >= 3 ? (
        <div className="p-4 rounded-xl bg-rose-950/90 border-2 border-rose-500 shadow-2xl shadow-rose-950 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-7 h-7 text-rose-300 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-mono font-black text-rose-100 uppercase tracking-wider">
                🛑 3-STRIKE DISCIPLINE LOCKOUT ACTIVATED
              </h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Markus Heitkoetter Rule: You have sustained 3 losses today. Trading is suspended for the remainder of the session to eliminate emotional revenge trading.
              </p>
            </div>
          </div>
          <button
            onClick={resetStrikes}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Discipline
          </button>
        </div>
      ) : null}

      {/* ─── MAIN TWO-COLUMN WORKBENCH ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Golden Ratio Bracket Order Engine */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-[#06080E] border border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Golden Ratio (Φ = 1.618) OCO Bracket Targets
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {isLong ? 'LONG BRACKET' : 'SHORT BRACKET'}
              </span>
            </div>

            <button
              onClick={copyBracketOrder}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy OCO Order'}</span>
            </button>
          </div>

          {/* Grid of Harmonic Price Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
            {/* Entry */}
            <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
              <span className="text-[9px] uppercase text-slate-400 block mb-1">Execution Entry</span>
              <div className="text-sm sm:text-base font-bold text-white">${entry.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Trigger baseline</span>
            </div>

            {/* Target 1: 1.0R */}
            <div className="p-3 rounded-xl bg-[#0B0F17] border border-blue-900/40">
              <span className="text-[9px] uppercase text-blue-400 block mb-1">TP1: 1.000R (Scale)</span>
              <div className="text-sm sm:text-base font-bold text-blue-300">
                ${target1R.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Derisk to breakeven</span>
            </div>

            {/* Target 2: Golden Target 1.618R */}
            <div className="p-3 rounded-xl bg-gradient-to-b from-amber-950/40 to-[#0B0F17] border border-amber-500/60 shadow-lg shadow-amber-950/30">
              <span className="text-[9px] uppercase text-amber-300 font-bold block mb-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> TP2: 1.618R (Golden)
              </span>
              <div className="text-sm sm:text-base font-black text-amber-300">
                ${goldenTarget2R.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-amber-400/80 mt-1 block font-bold">+1.618× Risk Target</span>
            </div>

            {/* Target 3: Golden Extension 2.618R */}
            <div className="p-3 rounded-xl bg-[#0B0F17] border border-purple-900/50">
              <span className="text-[9px] uppercase text-purple-400 block mb-1">TP3: 2.618R (Ext)</span>
              <div className="text-sm sm:text-base font-bold text-purple-300">
                ${goldenExtension3R.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-purple-400/80 mt-1 block">+2.618× Runner Expansion</span>
            </div>
          </div>

          {/* Fibonacci 0.382 & 0.618 Pullback Reload Bar */}
          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Fibonacci Golden Pullback Zones:
            </span>
            <div className="flex items-center gap-4">
              <span>
                0.382 Retrace: <strong className="text-white">${fib382.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
              <span>
                0.618 Golden Pocket: <strong className="text-amber-400">${fib618.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Strike Discipline Tracker */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#06080E] border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                Heitkoetter 3-Strike Tracker
              </span>
              <span className="text-[10px] font-mono text-slate-500">Max 3 Losses / Day</span>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              If you hit your stop-loss, record a strike. Once 3 strikes are logged, the terminal engages the daily circuit breaker.
            </p>

            {/* Strikes visual boxes */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[1, 2, 3].map((num) => {
                const isStruck = strikes >= num;
                return (
                  <div
                    key={num}
                    className={`py-3 rounded-xl border text-center transition-all ${
                      isStruck
                        ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-md shadow-rose-950'
                        : 'bg-[#0B0F17] border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-mono font-black">{isStruck ? '✕' : num}</div>
                    <span className="text-[9px] font-mono uppercase block mt-0.5">
                      {isStruck ? 'Strike' : 'Clear'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
            <button
              onClick={recordStrike}
              disabled={strikes >= 3}
              className="flex-1 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-mono font-bold transition-all disabled:opacity-40"
            >
              + Record Stop-Out
            </button>
            <button
              onClick={resetStrikes}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Reset today's strikes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

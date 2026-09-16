'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Globe, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BrainSessionClockConverter() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 text-center text-xs font-mono text-slate-500 animate-pulse">
        Synchronizing Global Market Atomic Clocks...
      </div>
    );
  }

  // Formatting times for Lisbon, London, and New York ET
  const lisbonTime = now.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Lisbon',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const londonTime = now.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const newYorkTime = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Determine current ET decimal hour (e.g. 10:30 is 10.5)
  const nyParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const nyHour = parseInt(nyParts.find((p) => p.type === 'hour')?.value || '0', 10);
  const nyMin = parseInt(nyParts.find((p) => p.type === 'minute')?.value || '0', 10);
  const etDecimal = nyHour + nyMin / 60;

  // Session classification
  let sessionName = 'Pre-Market / Overnight';
  let sessionColor = 'text-slate-400';
  let sessionBadge = 'bg-slate-800 border-slate-700 text-slate-300';
  let sessionDesc = 'US cash equity markets closed. Crypto trades continuously with baseline weekend/night volume.';
  let sessionAction = 'Do not force equity trades. Prepare limit levels for the 14:30 Lisbon open.';

  if (etDecimal >= 9.5 && etDecimal < 10.0) {
    sessionName = '1. Opening Rush (14:30–15:00 Lisbon / 09:30–10:00 ET)';
    sessionColor = 'text-amber-400';
    sessionBadge = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
    sessionDesc = 'Extreme volatility and stop hunts. Overnight order imbalances are cleared. High fakeout probability.';
    sessionAction = 'Avoid market orders. Wait for the initial 30-minute range to establish.';
  } else if (etDecimal >= 10.0 && etDecimal < 11.5) {
    sessionName = '2. Institutional Golden Window (15:00–16:30 Lisbon / 10:00–11:30 ET)';
    sessionColor = 'text-emerald-400';
    sessionBadge = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    sessionDesc = 'Cleanest institutional liquidity and directional momentum. Highest statistical conviction for trend continuation.';
    sessionAction = 'Optimal execution window for swing dip entries and high-probability intraday scalps.';
  } else if (etDecimal >= 11.5 && etDecimal < 13.5) {
    sessionName = '3. Lunch Danger Chop Zone (16:30–18:30 Lisbon / 11:30–13:30 ET)';
    sessionColor = 'text-rose-400';
    sessionBadge = 'bg-rose-500/20 border-rose-500/40 text-rose-300';
    sessionDesc = 'Wall Street traders away for lunch. Institutional volume drops by ~50%. Algorithmic chop hunts retail stops.';
    sessionAction = 'STRICT HANDS-OFF ZONE. Do not open fresh breakout trades. Let existing positions run.';
  } else if (etDecimal >= 13.5 && etDecimal < 15.25) {
    sessionName = '4. Afternoon Trend Resumption (18:30–20:15 Lisbon / 13:30–15:15 ET)';
    sessionColor = 'text-cyan-400';
    sessionBadge = 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
    sessionDesc = 'Institutional desks return. Morning trends frequently re-accelerate toward key pivotal points.';
    sessionAction = 'Favorable for scaling profits or trailing stop-losses to breakeven.';
  } else if (etDecimal >= 15.25 && etDecimal < 16.0) {
    sessionName = '5. Closing Squaring-Up & 0DTE Danger (20:15–21:00 Lisbon / 15:15–16:00 ET)';
    sessionColor = 'text-purple-400';
    sessionBadge = 'bg-purple-500/20 border-purple-500/40 text-purple-300';
    sessionDesc = 'High-frequency Market-on-Close (MOC) order flow. Gamma explosions on expiring 0DTE options.';
    sessionAction = 'Take profits. Never buy same-day options in this window (theta decay is fatal).';
  } else if (etDecimal >= 16.0 && etDecimal < 20.0) {
    sessionName = 'Post-Market Settlement (21:00–01:00 Lisbon / 16:00–20:00 ET)';
    sessionColor = 'text-blue-400';
    sessionBadge = 'bg-blue-500/20 border-blue-500/40 text-blue-300';
    sessionDesc = 'Earnings releases and after-hours macro commentary.';
    sessionAction = 'Review logged trades in your Douglas 20-batch and check Defcon radar.';
  }

  // Day progress bar (from 09:30 to 16:00 ET = 6.5 hours)
  const isMarketHours = etDecimal >= 9.5 && etDecimal <= 16.0;
  const progressPct = isMarketHours
    ? Math.min(100, Math.max(0, ((etDecimal - 9.5) / 6.5) * 100))
    : 0;

  return (
    <div className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-white tracking-wide">
              LISBON ⇄ NEW YORK ET INTRADAY SESSION CONVERTER
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live market session synchronization: Wall Street is ET (Lisbon - 5 Hours)
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${sessionBadge}`}>
          {isMarketHours ? 'REGULAR TRADING HOURS ACTIVE' : 'MARKET CLOSED / PRE-MARKET'}
        </div>
      </div>

      {/* Clocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Lisbon Clock */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Lisbon Local Time (WEST)
            </span>
            <span className="text-2xl font-mono font-black text-amber-300 mt-1 block">
              {lisbonTime}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            UTC+1
          </span>
        </div>

        {/* London Clock */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              London (BST / GMT)
            </span>
            <span className="text-2xl font-mono font-black text-slate-200 mt-1 block">
              {londonTime}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            UTC+1
          </span>
        </div>

        {/* New York Clock */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              New York Wall St (ET)
            </span>
            <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block">
              {newYorkTime}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            UTC-4
          </span>
        </div>
      </div>

      {/* Active Phase Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Current Market Window
          </span>
          <span className={`text-sm font-mono font-bold ${sessionColor}`}>
            {sessionName}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          {sessionDesc}
        </p>

        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span><strong className="text-white">PEAK Rule:</strong> {sessionAction}</span>
        </div>

        {/* Session Progress Visual Timeline */}
        {isMarketHours && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>14:30 Lisbon Open</span>
              <span>16:30 Lunch Chop</span>
              <span>21:00 Close</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { DipConvictionSnapshot } from '@/lib/types';
import { CheckCircle2, AlertCircle, Calendar, Gauge, Zap, TrendingDown } from 'lucide-react';

interface ConvictionCockpitProps {
  conviction: DipConvictionSnapshot | null;
  loading: boolean;
}

export default function ConvictionCockpit({ conviction, loading }: ConvictionCockpitProps) {
  if (loading || !conviction) {
    return (
      <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
          <div className="h-28 bg-slate-800/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { compositeScore, signalLabel, signalColor, triggers, indicators } = conviction;

  // Signal description text
  let signalHeading = 'Neutral Market Conditions';
  let signalDesc =
    'No extreme statistical capitulation detected. Standard dollar-cost averaging applies; avoid aggressive leveraged dip buys.';

  if (signalLabel === 'STRONG_DIP_BUY') {
    signalHeading = 'High-Conviction Dip Buying Opportunity';
    signalDesc =
      'Multiple capitulation filters triggered concurrently (Oversold RSI, macro support retest, or panic sentiment). Historically offers optimal risk-adjusted asymmetric upside.';
  } else if (signalLabel === 'MODERATE_DIP') {
    signalHeading = 'Moderate Pullback / Value Entry';
    signalDesc =
      'Price is testing key moving averages or exhibiting early oversold metrics. Favorable scaling-in window with staggered limit orders.';
  } else if (signalLabel === 'EXTENDED') {
    signalHeading = 'Extended / Overbought Zone';
    signalDesc =
      'Market is stretched above moving averages. Risk-reward for fresh long dip-buys is unfavorable; consider trailing stop losses.';
  }

  return (
    <div className="bg-[#0F1420] border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient based on signal */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-20"
        style={{ backgroundColor: signalColor }}
      />

      {/* Top Banner: Composite Conviction Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex items-start gap-4">
          {/* Circular Score Badge */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#080B11] border border-slate-700/80 p-2 shadow-inner">
            <div className="text-center">
              <span
                className="font-mono text-3xl font-black tracking-tight"
                style={{ color: signalColor }}
              >
                {compositeScore}
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="px-2.5 py-1 rounded-md text-xs font-mono font-black tracking-wider uppercase"
                style={{
                  backgroundColor: `${signalColor}20`,
                  color: signalColor,
                  border: `1px solid ${signalColor}50`,
                }}
              >
                {signalLabel.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Updated {conviction.lastUpdated}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1.5">{signalHeading}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
              {signalDesc}
            </p>
          </div>
        </div>

        {/* Linear Progress Meter */}
        <div className="w-full lg:w-72 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Timing Conviction</span>
            <span className="font-bold text-white">{compositeScore}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(5, compositeScore)}%`,
                backgroundColor: signalColor,
                boxShadow: `0 0 12px ${signalColor}80`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0 (EXTENDED)</span>
            <span>50 (NEUTRAL)</span>
            <span>100 (CAPITULATION)</span>
          </div>
        </div>
      </div>

      {/* Core Analytical Trigger Grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Rule-Based Analytical Trigger Matrix</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {triggers.filter((t) => t.active).length} of {triggers.length} Triggers Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {triggers.map((trigger) => (
            <div
              key={trigger.id}
              className={`p-3.5 rounded-xl border transition-all ${
                trigger.active
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                  : 'bg-[#080B11]/80 border-slate-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {trigger.name.split('(')[0]}
                </span>
                {trigger.active ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <span
                  className={`font-mono text-base font-bold ${
                    trigger.active ? 'text-emerald-300' : 'text-slate-200'
                  }`}
                >
                  {trigger.valueDescription}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: {trigger.thresholdDescription}
                </span>
              </div>

              <div className="mt-2 text-[10px] font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">Engine Weight</span>
                <span className="font-semibold text-slate-300">+{trigger.weight} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Timing Tendency Banner */}
      {indicators.calendarStatus.isFavorableWindow && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-mono">
            <span className="font-bold text-emerald-300">Active Calendar Tendency: </span>
            <span className="text-slate-300">{indicators.calendarStatus.reason}</span>
          </div>
        </div>
      )}
    </div>
  );
}

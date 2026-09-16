'use client';

import React from 'react';
import { MLPrediction } from '@/lib/types';
import { BrainCircuit, TrendingUp, TrendingDown, Shuffle, Sparkles } from 'lucide-react';

interface MLInsightsCardProps {
  ml: MLPrediction | undefined;
  symbol: string;
}

export default function MLInsightsCard({ ml, symbol }: MLInsightsCardProps) {
  if (!ml) return null;

  const { regime, dipSuccessProb14d, expectedFwdReturn14d, featureContributions } = ml;

  // Regime styling
  let regimeLabel = 'Volatile Chop / Range';
  let regimeColor = 'text-amber-400 bg-amber-950/40 border-amber-700/50';
  let RegimeIcon = Shuffle;

  if (regime === 'BULL_TREND') {
    regimeLabel = 'Structural Bull Trend';
    regimeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-700/50';
    RegimeIcon = TrendingUp;
  } else if (regime === 'BEAR_TREND') {
    regimeLabel = 'Macro Bear Downtrend';
    regimeColor = 'text-rose-400 bg-rose-950/40 border-rose-700/50';
    RegimeIcon = TrendingDown;
  }

  const winPct = Math.round(dipSuccessProb14d * 100);

  return (
    <div className="bg-[#0F1420] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                Machine Learning Signal Enhancer
              </h3>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                Random Forest + Logit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Walk-forward regime-aware probability calibration
            </p>
          </div>
        </div>

        {/* Regime Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${regimeColor}`}>
          <RegimeIcon className="w-4 h-4" />
          <span>{regimeLabel}</span>
        </div>
      </div>

      {/* Probability & Expected Return Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
        <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">
              14-Day Bounce Probability P(Win)
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`font-mono text-3xl font-black ${
                winPct >= 70
                  ? 'text-emerald-400'
                  : winPct >= 50
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }`}
            >
              {winPct}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              historical probability
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${winPct}%`,
                backgroundColor: winPct >= 70 ? '#10B981' : winPct >= 50 ? '#3B82F6' : '#F59E0B',
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">
              Expected 14-Day Forward Return
            </span>
            <span className="text-xs font-mono text-slate-400">Model Forecast</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`font-mono text-3xl font-black ${
                expectedFwdReturn14d > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {expectedFwdReturn14d > 0 ? '+' : ''}
              {expectedFwdReturn14d.toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              median risk-adjusted
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {regime === 'BEAR_TREND'
              ? 'Warning: Macro downtrend lowers forward bounce expectations.'
              : 'Calibrated across historical drawdowns in this regime.'}
          </p>
        </div>
      </div>

      {/* Feature Attribution & Explainability (SHAP style) */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
          Feature Contributions & Factor Attribution
        </h4>
        <div className="space-y-2.5">
          {featureContributions.map((fc, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-[#080B11]/60 border border-slate-800/60 text-xs font-mono gap-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    fc.direction === 'bullish'
                      ? 'bg-emerald-400'
                      : fc.direction === 'bearish'
                      ? 'bg-rose-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="font-bold text-slate-200">{fc.feature}:</span>
                <span className="text-slate-400 text-[11px]">{fc.description}</span>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                <span
                  className={`font-bold ${
                    fc.impact > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {fc.impact > 0 ? '+' : ''}
                  {Math.round(fc.impact * 100)}%
                </span>
                <span className="text-[10px] text-slate-400">impact</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

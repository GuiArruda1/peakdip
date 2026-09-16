'use client';

import React, { useState } from 'react';
import {
  Eye,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowRight,
  Terminal,
  HelpCircle,
  Radio,
  Cpu,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { DipConvictionSnapshot } from '@/lib/types';
import { GeopoliticalRiskState } from '@/lib/engine/geopolitical';
import { calculateSimulacrumDivergence, SimulacrumAnalysis } from '@/lib/engine/simulacrum';

interface SimulacrumRadarProps {
  btcConviction: DipConvictionSnapshot | null;
  spyConviction: DipConvictionSnapshot | null;
  defconData?: GeopoliticalRiskState | null;
}

export default function SimulacrumRadar({
  btcConviction,
  spyConviction,
  defconData,
}: SimulacrumRadarProps) {
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SPY'>('BTC');
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [quoteOffset, setQuoteOffset] = useState(0);
  const [internalDefcon, setInternalDefcon] = useState<GeopoliticalRiskState | null>(null);

  React.useEffect(() => {
    if (!defconData) {
      fetch('/api/geopolitical-risk')
        .then((res) => res.ok ? res.json() : null)
        .then((data: GeopoliticalRiskState | null) => {
          if (data) setInternalDefcon(data);
        })
        .catch(() => {});
    }
  }, [defconData]);

  const activeConviction = selectedAsset === 'BTC' ? btcConviction : spyConviction;
  const analysis: SimulacrumAnalysis = calculateSimulacrumDivergence(
    selectedAsset,
    activeConviction,
    defconData || internalDefcon,
    quoteOffset
  );

  const isRedPill = analysis.state === 'RED_PILL_GLITCH';
  const isMatrixMirage = analysis.state === 'MATRIX_MIRAGE';

  return (
    <div className="bg-[#090D16] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-6">
      {/* ─── HEADER BAR ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 via-emerald-500/10 to-transparent border border-purple-500/40 flex items-center justify-center shrink-0">
            <Eye className={`w-6 h-6 ${isRedPill ? 'text-emerald-400 animate-pulse' : isMatrixMirage ? 'text-rose-400' : 'text-purple-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                BAUDRILLARD SIMULACRA RADAR
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border ${
                isRedPill 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                  : isMatrixMirage 
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/60' 
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                {isRedPill ? '🔴 Red Pill Glitch' : isMatrixMirage ? '⚠️ Matrix Mirage' : '⚖️ Coherent'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              4th-Order Hyperreality Engine: Arbitraging the rift between manufactured media panic and physical liquidity.
            </p>
          </div>
        </div>

        {/* Controls: Asset Switcher & Philosophy Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPhilosophy(!showPhilosophy)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all border border-slate-800"
            title="Read Jean Baudrillard philosophical framework"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Framework</span>
          </button>

          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setSelectedAsset('BTC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedAsset === 'BTC'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ₿ Bitcoin
            </button>
            <button
              onClick={() => setSelectedAsset('SPY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedAsset === 'SPY'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 S&P 500
            </button>
          </div>
        </div>
      </div>

      {/* ─── OPTIONAL PHILOSOPHICAL DOCTRINE MODAL/DRAWER ─── */}
      {showPhilosophy && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 font-mono text-xs text-slate-300 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-purple-300 pb-1 border-b border-purple-800/30">
            <span>Jean Baudrillard: Simulacra and Simulation (1981)</span>
            <span className="text-[10px] text-purple-400">4th-Order Hyperreality</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            &ldquo;The simulation of something begins to take the place of the reality.&rdquo; Modern financial markets no longer trade factory profits; they trade the shadows of headlines, algorithmic sentiment loops, and options delta hedging. 95% of retail traders lose because they trade inside the manufactured narrative. PEAK exploits the mathematical divergence (<span className="text-emerald-400 font-bold">&Delta;_sim</span>) when the simulation breaks away from physical order flow.
          </p>
        </div>
      )}

      {/* ─── DIVERGENCE SPECTRUM GAUGE ─── */}
      <div className="space-y-3 bg-[#06080E] p-4 sm:p-5 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Simulacrum Gap (&Delta;_sim):</span>
            <span className={`text-base font-black ${
              isRedPill ? 'text-emerald-400' : isMatrixMirage ? 'text-rose-400' : 'text-cyan-400'
            }`}>
              {analysis.simulacrumGap > 0 ? `+${analysis.simulacrumGap}` : analysis.simulacrumGap}
            </span>
            <span className="text-slate-500 text-[10px]">[-100 to +100 Scale]</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Divergence Intensity:</span>
            <span className="font-bold text-white">{analysis.glitchIntensityPct}%</span>
          </div>
        </div>

        {/* 3-Way Bi-Directional Spectrum Bar */}
        <div className="relative w-full h-4 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          {/* Zero Center Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 z-10" />

          {/* Fill based on positive or negative gap */}
          {analysis.simulacrumGap >= 0 ? (
            <div
              className="absolute top-0 bottom-0 left-1/2 bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-r-full"
              style={{ width: `${Math.min(50, (analysis.simulacrumGap / 100) * 50)}%` }}
            />
          ) : (
            <div
              className="absolute top-0 bottom-0 right-1/2 bg-gradient-to-l from-purple-500 to-rose-500 transition-all duration-500 rounded-l-full"
              style={{ width: `${Math.min(50, (Math.abs(analysis.simulacrumGap) / 100) * 50)}%` }}
            />
          )}
        </div>

        {/* Labels underneath spectrum bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span className="text-rose-400/80">← -100 Matrix Mirage (Euphoria Bubble)</span>
          <span className="text-slate-400">0 Coherent</span>
          <span className="text-emerald-400/80">+100 Red Pill Glitch (Capitulation Floor) →</span>
        </div>
      </div>

      {/* ─── DUAL SPECTRUM BREAKDOWN: THE ILLUSION vs THE GROUND TRUTH ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: The Illusion (Narrative Simulation) */}
        <div className="p-4 rounded-xl bg-[#06080E] border border-rose-900/30 space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                1. The Illusion (Narrative)
              </span>
            </div>
            <span className={`text-xs font-bold ${analysis.narrativeScore < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              Score: {analysis.narrativeScore}
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Media Sentiment Loop:</span>
              <span className="font-bold text-white">{analysis.headlineEchoChamber.status}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Fear & Greed Indicator:</span>
              <span className="font-bold text-white">
                {analysis.headlineEchoChamber.fearGreedValue}/100 ({analysis.headlineEchoChamber.fearGreedLabel})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Geopolitical Conflict Noise:</span>
              <span className="font-bold text-amber-300">DEFCON {defconData?.defconLevel ?? internalDefcon?.defconLevel ?? 5} Threat Layer</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[10px] text-slate-400 leading-tight">
            📡 <strong>Narrative Function:</strong> Amplifies emotional contagion. Retail reads headlines and reacts; market makers capture the spread.
          </div>
        </div>

        {/* Right: The Ground Truth (Mechanical Reality) */}
        <div className="p-4 rounded-xl bg-[#06080E] border border-emerald-900/30 space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                2. The Ground Truth (Plumbing)
              </span>
            </div>
            <span className={`text-xs font-bold ${analysis.mechanicalScore >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              Score: {analysis.mechanicalScore > 0 ? `+${analysis.mechanicalScore}` : analysis.mechanicalScore}
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Institutional Absorption:</span>
              <span className={`font-bold ${analysis.mechanicalGroundTruth.institutionalAbsorption ? 'text-emerald-400' : 'text-slate-400'}`}>
                {analysis.mechanicalGroundTruth.institutionalAbsorption ? 'Active Liquidity Absorption' : 'Passive Order Book'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Elder-Ray Force State:</span>
              <span className="font-bold text-white">{analysis.mechanicalGroundTruth.elderRayState}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>200-SMA Institutional Proximity:</span>
              <span className="font-bold text-cyan-300">
                {analysis.mechanicalGroundTruth.sma200DistancePct > 0 ? `+${analysis.mechanicalGroundTruth.sma200DistancePct.toFixed(1)}%` : `${analysis.mechanicalGroundTruth.sma200DistancePct.toFixed(1)}%`}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-[10px] text-slate-400 leading-tight">
            ⚙️ <strong>Mechanical Function:</strong> Tracks genuine liquidity boundaries, options delta pins, and volume exhaustion rather than words.
          </div>
        </div>
      </div>

      {/* ─── TACTICAL ARBITRAGE DIRECTIVE BANNER ─── */}
      <div className={`p-4 rounded-xl border font-mono space-y-2.5 ${
        isRedPill
          ? 'bg-gradient-to-r from-emerald-950/60 via-[#06080E] to-[#06080E] border-emerald-500/70 shadow-lg shadow-emerald-950/50'
          : isMatrixMirage
          ? 'bg-gradient-to-r from-rose-950/60 via-[#06080E] to-[#06080E] border-rose-500/70 shadow-lg shadow-rose-950/50'
          : 'bg-[#06080E] border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className={`w-4 h-4 ${isRedPill ? 'text-emerald-400' : isMatrixMirage ? 'text-rose-400' : 'text-amber-400'}`} />
            {analysis.tacticalDirective.title}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
            analysis.tacticalDirective.action === 'AGGRESSIVE_LONG'
              ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500'
              : analysis.tacticalDirective.action === 'CAPITAL_SHIELD'
              ? 'bg-rose-900/60 text-rose-200 border-rose-500'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            ACTION: {analysis.tacticalDirective.action.replace('_', ' ')}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {analysis.tacticalDirective.summary}
        </p>

        <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-300 gap-2">
          <div className="flex items-start gap-1.5 italic text-slate-300">
            <span className="text-purple-400 font-serif text-sm leading-none">&ldquo;</span>
            <span className="leading-relaxed">{analysis.tacticalDirective.baudrillardQuote.quote}</span>
            <span className="text-purple-400 font-serif text-sm leading-none">&rdquo;</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 not-italic font-mono text-[10px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
              Daily Phrase #{analysis.tacticalDirective.baudrillardQuote.dayIndex} • {analysis.tacticalDirective.baudrillardQuote.context}
            </span>
            <button
              onClick={() => setQuoteOffset((prev) => prev + 1)}
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-purple-300 transition-all border border-slate-700/60"
              title="Cycle to next phrase from Simulacra and Simulation"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

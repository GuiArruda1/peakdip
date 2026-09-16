'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  ShieldAlert,
  Clock,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  BatchTradeRecord,
  calculateDouglasBatchMetrics,
  calculateHougaardDiscipline,
  calculateLivermoreSitting,
  calculatePTJAsymmetry,
  MINDSET_MASTER_QUOTES,
} from '@/lib/engine/mindset';
import { DipConvictionSnapshot } from '@/lib/types';

interface MindsetMasteryCockpitProps {
  btcConviction: DipConvictionSnapshot | null;
  spyConviction: DipConvictionSnapshot | null;
}

// Initial realistic default sample batch (8 trades logged out of 20)
const DEFAULT_INITIAL_BATCH: BatchTradeRecord[] = [
  { id: 't1', batchIndex: 1, asset: 'BTC', outcome: 'WIN', rMultiple: 1.62, pnlUsd: 162, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 7 },
  { id: 't2', batchIndex: 2, asset: 'SPY', outcome: 'LOSS', rMultiple: -1.0, pnlUsd: -100, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 6 },
  { id: 't3', batchIndex: 3, asset: 'BTC', outcome: 'WIN', rMultiple: 2.1, pnlUsd: 210, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 5 },
  { id: 't4', batchIndex: 4, asset: 'BTC', outcome: 'LOSS', rMultiple: -1.0, pnlUsd: -100, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 4 },
  { id: 't5', batchIndex: 5, asset: 'SPY', outcome: 'WIN', rMultiple: 1.62, pnlUsd: 162, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 3 },
  { id: 't6', batchIndex: 6, asset: 'BTC', outcome: 'WIN', rMultiple: 3.2, pnlUsd: 320, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 2 },
  { id: 't7', batchIndex: 7, asset: 'SPY', outcome: 'LOSS', rMultiple: -1.0, pnlUsd: -100, followedRules: true, stopCompliant: true, timestamp: Date.now() - 86400000 * 1 },
];

export default function MindsetMasteryCockpit({
  btcConviction,
  spyConviction,
}: MindsetMasteryCockpitProps) {
  const [activeTab, setActiveTab] = useState<'douglas' | 'hougaard' | 'livermore' | 'ptj'>('douglas');
  const [trades, setTrades] = useState<BatchTradeRecord[]>([]);
  const [batchId, setBatchId] = useState<number>(1);
  const [lastTradeTime, setLastTradeTime] = useState<number>(Date.now() - 1000 * 60 * 60 * 38); // 38h ago default
  const [isClient, setIsClient] = useState(false);

  // PTJ Asymmetry inputs
  const activePrice = btcConviction?.currentPrice || 91200;
  const [calcEntry, setCalcEntry] = useState<number>(activePrice);
  const [calcStop, setCalcStop] = useState<number>(Math.round(activePrice * 0.965));
  const [calcTarget, setCalcTarget] = useState<number>(Math.round(activePrice * 1.12));

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedTrades = localStorage.getItem('peak_mindset_trades_v1');
      const savedBatchId = localStorage.getItem('peak_mindset_batch_id_v1');
      const savedTime = localStorage.getItem('peak_mindset_last_trade_time');

      if (savedTrades) {
        setTrades(JSON.parse(savedTrades));
      } else {
        setTrades(DEFAULT_INITIAL_BATCH);
      }

      if (savedBatchId) setBatchId(parseInt(savedBatchId, 10));
      if (savedTime) setLastTradeTime(parseInt(savedTime, 10));
    } catch {
      setTrades(DEFAULT_INITIAL_BATCH);
    }
  }, []);

  // Update calculator entry when btcConviction price loads if user hasn't modified it
  useEffect(() => {
    if (btcConviction?.currentPrice && calcEntry === 91200) {
      setCalcEntry(btcConviction.currentPrice);
      setCalcStop(Math.round(btcConviction.currentPrice * 0.965));
      setCalcTarget(Math.round(btcConviction.currentPrice * 1.12));
    }
  }, [btcConviction?.currentPrice, calcEntry]);

  // Save to localStorage when trades change
  const saveBatch = (newTrades: BatchTradeRecord[], newBatchId = batchId) => {
    setTrades(newTrades);
    setBatchId(newBatchId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('peak_mindset_trades_v1', JSON.stringify(newTrades));
      localStorage.setItem('peak_mindset_batch_id_v1', newBatchId.toString());
    }
  };

  // Log Trade Action
  const handleLogTrade = (outcome: 'WIN' | 'LOSS', stopCompliant = true) => {
    if (trades.length >= 20) {
      alert('This 20-trade batch is complete! Click "Start Next Batch" to evaluate the completed batch.');
      return;
    }

    const nextIndex = trades.length + 1;
    const rMultiple = outcome === 'WIN' ? 1.62 : -1.0;
    const newRecord: BatchTradeRecord = {
      id: 't_' + Date.now(),
      batchIndex: nextIndex,
      asset: btcConviction ? 'BTC' : 'SPY',
      outcome,
      rMultiple,
      pnlUsd: outcome === 'WIN' ? 162 : -100,
      followedRules: true,
      stopCompliant,
      timestamp: Date.now(),
    };

    const updated = [...trades, newRecord];
    const now = Date.now();
    setLastTradeTime(now);
    if (typeof window !== 'undefined') {
      localStorage.setItem('peak_mindset_last_trade_time', now.toString());
    }
    saveBatch(updated);
  };

  // Reset / Next Batch
  const handleResetBatch = () => {
    if (confirm('Start a fresh 20-Trade Batch? Your previous batch will be archived.')) {
      saveBatch([], batchId + 1);
    }
  };

  // Computed Engine States
  const douglasMetrics = useMemo(
    () => calculateDouglasBatchMetrics(trades, batchId),
    [trades, batchId]
  );

  const hougaardMetrics = useMemo(
    () => calculateHougaardDiscipline(trades),
    [trades]
  );

  const livermoreMetrics = useMemo(() => {
    const sma200 = btcConviction?.indicators.sma200 ?? (activePrice * 0.95);
    const rsi = btcConviction?.indicators.rsi14 ?? 45;
    return calculateLivermoreSitting(lastTradeTime, activePrice, sma200, rsi);
  }, [lastTradeTime, activePrice, btcConviction]);

  const ptjMetrics = useMemo(
    () => calculatePTJAsymmetry(calcEntry, calcStop, calcTarget),
    [calcEntry, calcStop, calcTarget]
  );

  // Daily Rotating Quote from the 4 Masters
  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const quotes = [
      ...MINDSET_MASTER_QUOTES.douglas.map(q => ({ ...q, author: 'Mark Douglas', book: 'Trading in the Zone' })),
      ...MINDSET_MASTER_QUOTES.hougaard.map(q => ({ ...q, author: 'Tom Hougaard', book: 'The Best Loser Wins' })),
      ...MINDSET_MASTER_QUOTES.livermore.map(q => ({ ...q, author: 'Jesse Livermore', book: 'Reminiscences of a Stock Operator' })),
      ...MINDSET_MASTER_QUOTES.schwagerPTJ.map(q => ({ ...q, author: q.author, book: 'Market Wizards' })),
    ];
    return quotes[dayOfYear % quotes.length];
  }, []);

  return (
    <div className="w-full bg-[#0B0F19]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white tracking-wide">
                MINDSET & RISK MASTERY COCKPIT
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                4 DOCTRINES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesis of Mark Douglas, Tom Hougaard, Jesse Livermore & Paul Tudor Jones
            </p>
          </div>
        </div>

        {/* Master Doctrine Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('douglas')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'douglas'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Douglas (20-Batch)</span>
          </button>
          <button
            onClick={() => setActiveTab('hougaard')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hougaard'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>2. Hougaard (Best Loser)</span>
          </button>
          <button
            onClick={() => setActiveTab('livermore')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'livermore'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3. Livermore (Sitting)</span>
          </button>
          <button
            onClick={() => setActiveTab('ptj')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ptj'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>4. PTJ (5:1 Asymmetry)</span>
          </button>
        </div>
      </div>

      {/* Rotating Master Thought Banner */}
      <div className="mt-4 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-amber-300 mr-2">[{dailyQuote.author} — {dailyQuote.book}]:</span>
          <span className="text-slate-300 italic">"{dailyQuote.quote}"</span>
        </div>
      </div>

      {/* TAB 1: MARK DOUGLAS 20-TRADE PROBABILISTIC BATCH */}
      {activeTab === 'douglas' && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-mono text-emerald-300">
                  MARK DOUGLAS 20-TRADE PROBABILISTIC SAMPLE BATCH #{batchId}
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {douglasMetrics.completedTrades}/20 Logged
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Douglas Rule: Never judge an edge on 1 or 2 trades. Complete a full 20-trade sample to reveal mathematical expectancy.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleLogTrade('WIN')}
                disabled={douglasMetrics.isComplete}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+ Log Win (+1.62R)</span>
              </button>
              <button
                onClick={() => handleLogTrade('LOSS', true)}
                disabled={douglasMetrics.isComplete}
                className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>+ Log Clean Loss (-1.0R)</span>
              </button>
              <button
                onClick={handleResetBatch}
                title="Start New Batch"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 20-Slot Visual Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 20 }, (_, i) => {
              const trade = trades[i];
              const isLogged = !!trade;
              const isWin = trade?.outcome === 'WIN';
              const isLoss = trade?.outcome === 'LOSS';

              return (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isWin
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-900/40'
                      : isLoss
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-sm shadow-rose-950/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-mono font-semibold">#{i + 1}</span>
                  <div className="mt-1 font-mono font-black text-xs">
                    {isWin ? '+1.6R' : isLoss ? '-1.0R' : '—'}
                  </div>
                  <span className="text-[8px] font-mono mt-0.5">
                    {isWin ? 'WIN' : isLoss ? 'LOSS' : 'OPEN'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Expectancy & Math Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Win Rate (W%)</span>
              <span className="text-lg font-mono font-black text-white mt-0.5 block">
                {douglasMetrics.winRate}%
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {douglasMetrics.wins}W / {douglasMetrics.losses}L
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Expectancy (E)</span>
              <span className={`text-lg font-mono font-black mt-0.5 block ${
                douglasMetrics.expectancyR >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {douglasMetrics.expectancyR >= 0 ? '+' : ''}{douglasMetrics.expectancyR}R
              </span>
              <span className="text-[10px] font-mono text-slate-500">per executed trade</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Realized R</span>
              <span className={`text-lg font-mono font-black mt-0.5 block ${
                douglasMetrics.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {douglasMetrics.totalR >= 0 ? '+' : ''}{douglasMetrics.totalR}R
              </span>
              <span className="text-[10px] font-mono text-slate-500">cumulative edge</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Rule Compliance</span>
              <span className="text-lg font-mono font-black text-amber-300 mt-0.5 block">
                {douglasMetrics.ruleComplianceRate}%
              </span>
              <span className="text-[10px] font-mono text-slate-500">plan adherence</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOM HOUGAARD "THE BEST LOSER WINS" */}
      {activeTab === 'hougaard' && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-mono text-rose-300">
                TOM HOUGAARD: THE BEST LOSER WINS DISCIPLINE METER
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Normal people hate being wrong and move their stop. Institutional traders treat taking a loss as a frictionless cost of business.
              </p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold self-start sm:self-auto">
              Status: {hougaardMetrics.disciplineTier.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Stop Compliance Rating
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-mono font-black text-emerald-400">
                    {hougaardMetrics.stopComplianceRate}%
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({hougaardMetrics.cleanCuts}/{hougaardMetrics.lossesLogged} clean stops)
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-500 ${
                    hougaardMetrics.stopComplianceRate >= 85
                      ? 'bg-emerald-500'
                      : hougaardMetrics.stopComplianceRate >= 65
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${hougaardMetrics.stopComplianceRate}%` }}
                />
              </div>
            </div>

            {/* Anti-Averaging-Down Shield */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-mono text-rose-300 uppercase font-bold tracking-wider">
                    Anti-Averaging-Down Shield
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  "If you add to a losing position, you are turning a calculated risk into an existential hope gamble."
                </p>
              </div>
              <div className="mt-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                Rule: Only add to <span className="text-emerald-400 font-bold">WINNERS</span>. Never to losers.
              </div>
            </div>

            {/* Log Uncontrolled Stop Action */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Did you widen a stop today?
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Honesty check: Logging violations preserves institutional self-awareness.
                </p>
              </div>
              <button
                onClick={() => handleLogTrade('LOSS', false)}
                disabled={douglasMetrics.isComplete}
                className="mt-3 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Widened / Hesitated Stop (-1.0R)</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 text-xs font-mono text-slate-300">
            <span className="text-rose-400 font-bold mr-2">Hougaard Principle:</span>
            {hougaardMetrics.feedback}
          </div>
        </div>
      )}

      {/* TAB 3: JESSE LIVERMORE "THE BIG SITTING" & PIVOTAL POINTS */}
      {activeTab === 'livermore' && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-mono text-amber-300">
                JESSE LIVERMORE: "THE BIG SITTING" PATIENCE CLOCK
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                "It was never my thinking that made the big money for me. It was my sitting tight."
              </p>
            </div>
            <button
              onClick={() => {
                const now = Date.now();
                setLastTradeTime(now);
                if (typeof window !== 'undefined') localStorage.setItem('peak_mindset_last_trade_time', now.toString());
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Cash Wait Timer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Live Cash Sitting Timer */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Time Spent in 100% Cash / Waiting
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-mono font-black text-amber-400">
                    {livermoreMetrics.hoursInCashWaiting}h
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({livermoreMetrics.daysInCashWaiting} days)
                  </span>
                </div>
              </div>
              <div className="mt-3 text-[11px] font-mono text-slate-400">
                Discipline Rating: <span className="text-amber-300 font-bold">{livermoreMetrics.patienceTier}</span>
              </div>
            </div>

            {/* Pivotal Point Indicator */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Livermore Pivotal Point Status
                </span>
                <div className="mt-2 text-sm font-mono font-bold text-white">
                  {livermoreMetrics.pivotalPointStatus === 'PIVOTAL_CAPITULATION' ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Capitulation Retest (200-SMA)
                    </span>
                  ) : livermoreMetrics.pivotalPointStatus === 'PIVOTAL_BREAKOUT' ? (
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Decisive Trend Breakout
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Mid-Range Chop (Do Nothing)
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 text-[11px] font-mono text-slate-400">
                Rule: Only trade when price reaches an unambiguous Pivotal Point.
              </div>
            </div>

            {/* Sitting Advice */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Line of Least Resistance
                </span>
                <p className="text-xs text-slate-300 mt-2">
                  "Men who can both be right and sit tight are uncommon. I found it one of the hardest things to learn."
                </p>
              </div>
              <div className="mt-3 text-[11px] font-mono text-amber-400/90 font-semibold">
                Wall Street Fool: Trades every day out of boredom.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAUL TUDOR JONES 5:1 ASYMMETRY EDGE FILTER */}
      {activeTab === 'ptj' && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-mono text-cyan-300">
                PAUL TUDOR JONES 5:1 ASYMMETRIC PAYOFF FILTER (MARKET WIZARDS)
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                "I'm looking for 5:1 risk/reward. 5:1 means I can be wrong 80% of the time and still not lose money."
              </p>
            </div>
            <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border self-start sm:self-auto ${
              ptjMetrics.rating === 'ELITE_PTJ_5_1'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : ptjMetrics.rating === 'EXCELLENT_3_1'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : ptjMetrics.rating === 'ACCEPTABLE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {ptjMetrics.rating.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Interactive Calculator Inputs */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Entry Price ($)
                </label>
                <input
                  type="number"
                  value={calcEntry}
                  onChange={(e) => setCalcEntry(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  value={calcStop}
                  onChange={(e) => setCalcStop(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Profit Target ($)
                </label>
                <input
                  type="number"
                  value={calcTarget}
                  onChange={(e) => setCalcTarget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Visual Ratio Bar & Math */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Asymmetry (R:R)</span>
                <span className={`text-xl font-mono font-black mt-0.5 block ${
                  ptjMetrics.asymmetryRatio >= 3 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {ptjMetrics.asymmetryRatio} : 1
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Breakeven Win Rate</span>
                <span className="text-xl font-mono font-black text-cyan-300 mt-0.5 block">
                  {ptjMetrics.breakevenWinRateReq}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Risk Amount</span>
                <span className="text-xl font-mono font-black text-rose-400 mt-0.5 block">
                  ${ptjMetrics.riskAmount}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Reward Potential</span>
                <span className="text-xl font-mono font-black text-emerald-400 mt-0.5 block">
                  ${ptjMetrics.rewardAmount}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-cyan-400 font-bold mr-2">PTJ Filter Verdict:</span>
              {ptjMetrics.summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

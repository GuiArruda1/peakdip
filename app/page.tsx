'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Bot,
  Activity,
  Percent,
  Lock,
  Layers,
  Flame,
  Clock,
  Eye,
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 selection:bg-emerald-500 selection:text-black font-sans relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1600px] left-0 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] pointer-events-none -z-10" />

      {/* ─── STICKY HEADER NAVBAR ─── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#060910]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-[1px] shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F17] rounded-[7px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-mono font-black text-lg tracking-wider text-white">
                PEAK<span className="text-emerald-400 font-light ml-1">DIP</span>
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 rounded">
                Quant AI
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#vision-ai" className="hover:text-emerald-400 transition-colors">Vision AI</a>
            <a href="#performance" className="hover:text-emerald-400 transition-colors">Performance</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          {/* Launch Terminal CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/terminal"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-950/80 border border-emerald-400/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Multimodal Vision AI & 24-Hour ATR Engine Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-400 font-normal">v2.4 Production</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Stop Buying Tops.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Master the Dip
          </span>{' '}
          with Institutional Math & Vision AI.
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-10 font-normal">
          PeakDip eliminates emotional FOMO and indicator clutter. Get deterministic{' '}
          <strong className="text-white font-semibold">0–100 Dip Conviction Scores</strong>, automated 5 core triggers, and a live AI Copilot that audits your TradingView and Quantfury screenshots in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/terminal"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono text-sm font-bold shadow-2xl shadow-emerald-950/80 border border-emerald-400/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch Live Terminal (Free Beta)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#vision-ai"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0F1420] hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>📷 See Screenshot AI in Action</span>
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-mono text-slate-400 border-y border-slate-800/80 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Works with Quantfury, Binance & Bybit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>85% Historical 90-Day Win Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Zero Repainting (Deterministic Math)</span>
          </div>
        </div>

        {/* ─── LIVE FLOATING TERMINAL PREVIEW WIDGET ─── */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-[#0B0F17]/90 border border-slate-700/90 shadow-2xl shadow-black p-4 sm:p-6 text-left relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none" />

          {/* Terminal Window Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">PEAK Live Market Intelligence — BTCUSDT</span>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TICK
            </span>
          </div>

          {/* Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {/* Asset & Conviction Gauge */}
            <div className="bg-[#060910] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>BITCOIN / USDT</span>
                  <span className="text-emerald-400 font-bold">+1.32%</span>
                </div>
                <div className="text-2xl font-black text-white">$77,274.78</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Timing Conviction Score:</span>
                  <span className="text-emerald-400 font-bold">70 / 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[70%]" />
                </div>
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  🟢 STRONG DIP BUY (CAPITULATION)
                </span>
              </div>
            </div>

            {/* Core Mathematical Triggers Status */}
            <div className="bg-[#060910] p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>The 5 Core Triggers</span>
                <span className="text-emerald-400">4 of 5 ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">RSI(14) Oversold (&lt;30)</span>
                <span className="text-emerald-400 font-bold">ACTIVE (28.4)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">200-SMA Uptrend Retest</span>
                <span className="text-emerald-400 font-bold">ACTIVE (+0.8%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">30d Drawdown Z-Score (&le;-2.5)</span>
                <span className="text-emerald-400 font-bold">ACTIVE (-2.7&sigma;)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Extreme Fear (&le;20)</span>
                <span className="text-emerald-400 font-bold">ACTIVE (18)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Calendar Window</span>
                <span className="text-slate-400">STANDBY</span>
              </div>
            </div>

            {/* AI Copilot Vision Callout */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-[#0B0F17] to-[#060910] p-4 rounded-xl border border-emerald-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold mb-1">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Copilot 24H Blueprint</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Support floor confirmed at <strong className="text-white">$76,675</strong>. Supply dry-up detected on candlestick wicks.
                </p>
              </div>

              <div className="mt-3 p-2 bg-[#060910] rounded border border-slate-800 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bounce Prob:</span>
                  <span className="text-emerald-400 font-bold">65% vs 35% Breakdown</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-400">Stop-Loss:</span>
                  <span className="text-rose-300 font-bold">$76,450 (-1.1%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">TP1 / TP2:</span>
                  <span className="text-emerald-300 font-bold">$78,550 / $79,800</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Live automated feed connected to Binance, TradingView & Yahoo Finance
            </span>
            <Link
              href="/terminal"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Enter Full Terminal →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            The 4 Superpowers
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for Mathematical Edge, Not Emotional Hope.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Superpower 1 */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mb-4 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-emerald-300 transition-colors">
              1. The 0–100 Conviction Cockpit
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Stop guessing. When price falls, PeakDip aggregates 5 quantitative rules into a single composite score. 
              Above 70 means historical capitulation with high asymmetric bounce edge. Under 30 warns you strictly to avoid catching falling knives.
            </p>
            <div className="flex gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                &ge;70: Strong Dip
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                50-69: Moderate Value
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                &lt;30: Caution Wait
              </span>
            </div>
          </div>

          {/* Superpower 2 */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center mb-4 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-purple-300 transition-colors">
              2. Multimodal Screenshot Vision AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Take a screenshot in Quantfury, TradingView, or Binance, and press <strong className="text-white font-mono">Cmd + V</strong> inside the terminal. 
              The vision copilot parses candlestick wicks, SFP liquidity sweeps, and calculates exact stop-loss and take-profit targets instantly.
            </p>
            <div className="flex gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Universal Clipboard Paste
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Lightbox Zoom Modal
              </span>
            </div>
          </div>

          {/* Superpower 3 */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-amber-300 transition-colors">
              3. 24-Hour Trade & Day Trade Scalper
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Looking for a setup over the next 24 hours? PeakDip’s dedicated daily engine computes 1x ATR daily volatility bounds, 
              giving you exact Stop-Loss, 12-hour TP1 with mandatory 50% scale-out, and 24-hour TP2 runner targets.
            </p>
            <div className="flex gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                2.8:1 Risk-to-Reward
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                50% Free-Roll Rule
              </span>
            </div>
          </div>

          {/* Superpower 4 */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-rose-300 transition-colors">
              4. AI Bubble Thermometer & Crash Protector
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Never buy a blow-off top again. The live Bubble Thermometer monitors macro distance to the 200-SMA and retail euphoria. 
              If the thermometer crosses 90&deg;, emergency warnings alert you to lock in profits and raise trailing stops.
            </p>
            <div className="flex gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Euphoria Shield
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Automated Profit Triggers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISION AI WALKTHROUGH SECTION ─── */}
      <section id="vision-ai" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 bg-gradient-to-b from-[#080C14] to-transparent rounded-3xl my-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono text-xs font-semibold">
            Multimodal Vision Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4 mb-3">
            From Screenshot to Trade in 3 Seconds
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-mono">
            No manual data entry. Paste any chart into PeakDip for institutional probability analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800 text-left relative">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-bold mb-4">
              1
            </span>
            <h4 className="text-sm font-bold text-white mb-2">Snap Any Chart</h4>
            <p className="text-slate-400 leading-relaxed">
              Take a screenshot on your Mac with <code className="text-emerald-300 bg-black/50 px-1.5 py-0.5 rounded">Cmd + Shift + 4</code> in Quantfury, TradingView, Binance, or your broker.
            </p>
          </div>

          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800 text-left relative">
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-bold mb-4">
              2
            </span>
            <h4 className="text-sm font-bold text-white mb-2">Paste Directly (Cmd + V)</h4>
            <p className="text-slate-400 leading-relaxed">
              Open the AI Live Copilot and press <code className="text-emerald-300 bg-black/50 px-1.5 py-0.5 rounded">Cmd + V</code>. It uploads straight from your clipboard without saving files to disk.
            </p>
          </div>

          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-emerald-500/40 text-left relative bg-gradient-to-br from-emerald-950/20 to-transparent">
            <span className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center justify-center font-bold mb-4">
              3
            </span>
            <h4 className="text-sm font-bold text-white mb-2">Instant Execution Targets</h4>
            <p className="text-slate-400 leading-relaxed">
              Get the visual probability meter (e.g. 65% Range Bounce), exact Invalidation Stop-Loss, TP1 scale-out, and TP2 runner target.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BACKTEST PERFORMANCE METRICS ─── */}
      <section id="performance" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            Historical Validation
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Walk-Forward Backtested Across 8+ Years of Cycles
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-center">
          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">85%</div>
            <div className="text-xs text-white font-bold mb-1">90-Day Win Rate</div>
            <p className="text-[10px] text-slate-400">Post-capitulation score &ge;70</p>
          </div>

          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 mb-1">+10.2%</div>
            <div className="text-xs text-white font-bold mb-1">Average 90-Day Gain</div>
            <p className="text-[10px] text-slate-400">Mean recovery per signal</p>
          </div>

          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1">2.8 : 1</div>
            <div className="text-xs text-white font-bold mb-1">Risk-to-Reward Skew</div>
            <p className="text-[10px] text-slate-400">Asymmetric trade structures</p>
          </div>

          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-slate-200 mb-1">-8.0%</div>
            <div className="text-xs text-white font-bold mb-1">Max Adverse Drawdown</div>
            <p className="text-[10px] text-slate-400">Absorbed with 1.5x ATR stops</p>
          </div>
        </div>
      </section>

      {/* ─── PRICING TIERS ─── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            Fair & Transparent Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Invest in a System, Not Emotional Gambles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Starter / Free Beta */}
          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Starter Beta</span>
              <div className="text-3xl font-black text-white mt-2 mb-1">$0</div>
              <span className="text-[11px] text-slate-400">Free forever during public beta</span>

              <div className="space-y-2.5 text-xs text-slate-300 mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time Conviction Cockpit (0-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Layer 3 TradingView Candlestick Chart</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5 AI Vision screenshot audits / day</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bitcoin (BTC) and S&P 500 (SPY)</span>
                </div>
              </div>
            </div>

            <Link
              href="/terminal"
              className="mt-8 block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Quant (Featured) */}
          <div className="bg-[#0B0F17] p-6 rounded-2xl border-2 border-emerald-500 shadow-xl shadow-emerald-950/50 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </span>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase">Pro Quant</span>
              <div className="text-3xl font-black text-white mt-2 mb-1">
                $39 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <span className="text-[11px] text-slate-400">For serious crypto & swing traders</span>

              <div className="space-y-2.5 text-xs text-slate-200 mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited</strong> Screenshot Vision AI Audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated 24-Hour Trade Execution Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Intraday Scalp Terminal (VWAP & EMA Ribbons)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Email & Browser Dip Alerts (&ge;70)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Bubble Thermometer Euphoria Alarms</span>
                </div>
              </div>
            </div>

            <Link
              href="/terminal"
              className="mt-8 block text-center py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all"
            >
              Start 14-Day Trial →
            </Link>
          </div>

          {/* Elite Whale */}
          <div className="bg-[#0B0F17] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase">Elite Whale</span>
              <div className="text-3xl font-black text-white mt-2 mb-1">
                $99 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <span className="text-[11px] text-slate-400">For algorithmic & multi-asset funds</span>

              <div className="space-y-2.5 text-xs text-slate-300 mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Pro Quant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Asset Suite (ETH, SOL, QQQ, NVDA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>TradingView Webhook Auto-Trading Execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Private VIP Alpha Discord & Telegram Group</span>
                </div>
              </div>
            </div>

            <Link
              href="/terminal"
              className="mt-8 block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              Contact Whale Desk
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ACCORDION ─── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            Got Questions?
          </h2>
          <p className="text-3xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {[
            {
              q: 'How does PeakDip differ from regular indicators on TradingView?',
              a: 'Standard indicators (like MACD or Stochastics) only look at single indicators and often repaint past bars. PeakDip uses a 4-layer quantitative decision architecture combining statistical drawdown Z-scores, multi-month 200-SMA cost bases, Wilder RSI, sentiment extremes, and seasonality. It never repaints.',
            },
            {
              q: 'How does the Multimodal Screenshot Vision AI work?',
              a: 'You can take a screenshot of any chart on your Mac or phone and press Cmd + V anywhere in the chat. PeakDip feeds the image to our vision models, which identify key candlestick wicks, SFP liquidity sweeps, support floors, and outputs an exact probability split with Stop-Loss and TP targets.',
            },
            {
              q: 'What exchanges and brokers can I use PeakDip with?',
              a: 'PeakDip is broker-agnostic. You can execute its signals on Quantfury, Binance, Bybit, Coinbase, Kraken, Interactive Brokers, Robinhood, or Webull. Simply copy the exact Entry, Stop-Loss, and Target prices into your broker.',
            },
            {
              q: 'Can I install PeakDip as a Mobile App on my phone?',
              a: 'Yes! PeakDip is a full Progressive Web App (PWA). Open it on Safari (iOS) or Chrome (Android) and tap "Add to Home Screen" for an app-like experience with tactile haptic buttons and a mobile dock.',
            },
            {
              q: 'Is PeakDip personalized financial advice?',
              a: 'No. PeakDip is an educational and mathematical decision-support software designed to help traders eliminate emotional bias and manage risk. All trading involves financial risk.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0B0F17] rounded-xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between font-bold text-white hover:text-emerald-300 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-slate-400 text-xs leading-relaxed border-t border-slate-800/60 font-sans">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA BANNER ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-emerald-950/60 via-[#0B0F17] to-[#060910] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 relative">
            Ready to Trade with Mathematical Discipline?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-mono max-w-xl mx-auto mb-8 relative">
            Access the live 0–100 Conviction Cockpit, Vision AI Copilot, and 24-Hour trade setups right now.
          </p>

          <Link
            href="/terminal"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:scale-105 active:scale-95 text-black font-mono text-sm font-black shadow-2xl shadow-emerald-950 transition-all relative"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>Launch Live Terminal Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-800/80 bg-[#04060B] py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm tracking-wider text-white">
              PEAK<span className="text-emerald-400 font-light ml-1">DIP</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-500">&copy; {new Date().getFullYear()} PeakDip Technologies. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/terminal" className="hover:text-emerald-400 transition-colors">Terminal</Link>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-900 text-[10px] text-slate-400 leading-relaxed text-center sm:text-left">
          <strong>Risk Disclaimer:</strong> PeakDip is a quantitative educational and market timing decision-support software. PeakDip is not an investment advisory service and does not offer personalized financial advice. Cryptocurrency and stock trading involves significant risk of capital loss. Past backtested performance does not guarantee future results.
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Skull,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const PRESET_LEVERAGES = [
  { label: '1x (Spot / Cash)', value: 1, tier: 'safe', desc: 'Zero liquidation risk. Real asset ownership.' },
  { label: '2x (Margin)', value: 2, tier: 'safe', desc: 'Controlled swing exposure. Wiped out only on -50% crash.' },
  { label: '5x (Micro Futures /MES)', value: 5, tier: 'moderate', desc: 'Institutional sweet spot for /MES. Requires disciplined stop.' },
  { label: '10x (Elevated)', value: 10, tier: 'hazard', desc: 'High hazard. A -10% drop wipes out 100% of capital.' },
  { label: '20x (Danger Zone)', value: 20, tier: 'danger', desc: 'Extreme risk. A standard -5% intraday wick liquidates you!' },
  { label: '50x (Crypto/CFD Trap)', value: 50, tier: 'death', desc: 'A -2.0% market noise wick triggers instant liquidation.' },
  { label: '100x (Degenerate)', value: 100, tier: 'death', desc: 'Mathematical suicide. A -1.0% micro-wobble wipes account.' },
];

export default function BrainLeverageSimulator() {
  const [accountBalance, setAccountBalance] = useState<number>(1000); // $1,000 default
  const [leverage, setLeverage] = useState<number>(5); // 5x default
  const [marketMovePct, setMarketMovePct] = useState<number>(-3.0); // -3% default move

  // Computed metrics
  const stats = useMemo(() => {
    const notionalExposure = accountBalance * leverage;
    const dollarPnL = notionalExposure * (marketMovePct / 100);
    const accountReturnPct = marketMovePct * leverage;
    const liquidationThresholdDrop = 100 / leverage;

    const isLiquidated = marketMovePct <= -liquidationThresholdDrop;
    const endingBalance = isLiquidated ? 0 : Math.max(0, accountBalance + dollarPnL);

    let riskTier: 'safe' | 'moderate' | 'hazard' | 'danger' | 'death' = 'safe';
    if (leverage >= 50) riskTier = 'death';
    else if (leverage >= 20) riskTier = 'danger';
    else if (leverage >= 10) riskTier = 'hazard';
    else if (leverage >= 4) riskTier = 'moderate';
    else riskTier = 'safe';

    return {
      notionalExposure: Math.round(notionalExposure),
      dollarPnL: Math.round(dollarPnL),
      accountReturnPct: Math.round(accountReturnPct * 10) / 10,
      liquidationThresholdDrop: Math.round(liquidationThresholdDrop * 10) / 10,
      isLiquidated,
      endingBalance: Math.round(endingBalance),
      riskTier,
    };
  }, [accountBalance, leverage, marketMovePct]);

  return (
    <div className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white tracking-wide">
                LEVERAGE & LIQUIDATION SIMULATOR (ALAVANCAGEM)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                RISK ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Purchasing power vs. risk capacity: Liquidation Threshold = 100% / Leverage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.isLiquidated ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-950/80 text-rose-300 border-2 border-rose-500 animate-pulse flex items-center gap-1.5 shadow-lg shadow-rose-950/80">
              <Skull className="w-4 h-4 text-rose-400" />
              <span>MARGIN CALL: ACCOUNT LIQUIDATED!</span>
            </span>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                stats.riskTier === 'safe'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : stats.riskTier === 'moderate'
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : stats.riskTier === 'hazard'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {stats.riskTier === 'safe'
                ? '🟢 SAFE / SPOT CONSERVATIVE'
                : stats.riskTier === 'moderate'
                ? '🔵 CONTROLLED / MES FUTURES'
                : stats.riskTier === 'hazard'
                ? '🟡 HIGH HAZARD'
                : stats.riskTier === 'danger'
                ? '🔴 DANGER: WICK VULNERABLE'
                : '☠️ DEGENERATE: LIQUIDATION TRAP'}
            </span>
          )}
        </div>
      </div>

      {/* Preset Leverage Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Select Institutional or Retail Leverage Preset:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {PRESET_LEVERAGES.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setLeverage(preset.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                leverage === preset.value
                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-mono font-black">{preset.value}x</span>
              <span className="text-[10px] font-mono block mt-0.5 truncate text-slate-300">
                {preset.label.split('(')[1]?.replace(')', '') || preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Account Capital */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 uppercase">Account Equity</span>
            <span className="text-sm font-mono font-bold text-white">${accountBalance.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={100}
            max={20000}
            step={100}
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>$100</span>
            <span>$5,000</span>
            <span>$20,000</span>
          </div>
        </div>

        {/* Leverage Custom Slider */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 uppercase">Leverage Multiplier</span>
            <span className="text-sm font-mono font-bold text-amber-400">{leverage}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>1x (Spot)</span>
            <span>20x</span>
            <span>100x (Death)</span>
          </div>
        </div>

        {/* Market Move Slider */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 uppercase">Simulated Market Move</span>
            <span
              className={`text-sm font-mono font-bold ${
                marketMovePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {marketMovePct >= 0 ? '+' : ''}
              {marketMovePct.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.5}
            value={marketMovePct}
            onChange={(e) => setMarketMovePct(Number(e.target.value))}
            className={`w-full cursor-pointer ${
              marketMovePct >= 0 ? 'accent-emerald-500' : 'accent-rose-500'
            }`}
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>-20% (Crash)</span>
            <span>0%</span>
            <span>+20% (Rally)</span>
          </div>
        </div>
      </div>

      {/* Simulator Results Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Position Exposure</span>
          <span className="text-xl font-mono font-black text-white mt-1 block">
            ${stats.notionalExposure.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {leverage}x your actual cash balance
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Dollar P&L on This Move</span>
          <span
            className={`text-xl font-mono font-black mt-1 block ${
              stats.isLiquidated
                ? 'text-rose-500'
                : stats.dollarPnL >= 0
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {stats.isLiquidated ? `-$${accountBalance.toLocaleString()}` : `${stats.dollarPnL >= 0 ? '+' : ''}$${stats.dollarPnL.toLocaleString()}`}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {stats.isLiquidated ? 'Total capital lost' : `${stats.accountReturnPct >= 0 ? '+' : ''}${stats.accountReturnPct}% on account`}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Ending Account Balance</span>
          <span
            className={`text-xl font-mono font-black mt-1 block ${
              stats.endingBalance === 0 ? 'text-rose-500' : 'text-white'
            }`}
          >
            ${stats.endingBalance.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {stats.isLiquidated ? 'Account balance is $0' : 'Surviving equity'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Liquidation Drop Required</span>
          <span className="text-xl font-mono font-black text-rose-400 mt-1 block">
            -{stats.liquidationThresholdDrop}%
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            market drop wipes out 100%
          </span>
        </div>
      </div>

      {/* The Bruce Kovner Institutional Lesson Box */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
        <div className="flex items-center gap-2 text-amber-400 font-mono font-bold uppercase">
          <Sparkles className="w-4 h-4" />
          <span>The Bruce Kovner Rule on Leverage (Market Wizards):</span>
        </div>
        <p>
          "First rule of trading: make the position size small enough that when you are wrong, you don't care. If you have a $5,000 account and your broker offers 20x leverage on Micro Futures (/MES), that is purchasing power, <strong>NOT</strong> permission to trade 20 contracts. Professional desks calculate size by setting a 1.5× ATR stop-loss and ensuring that hitting that stop loses no more than <strong>1% to 2% of total equity</strong>."
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Percent,
  TrendingDown,
  Target,
  Lock,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ElderRiskCalculatorProps {
  currentPrice: number;
  symbol: string;
  recommendedStopPrice?: number;
}

export default function ElderRiskCalculator({
  currentPrice,
  symbol,
  recommendedStopPrice,
}: ElderRiskCalculatorProps) {
  const [accountEquity, setAccountEquity] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(2); // Default 2% Rule
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice || 100);

  // Default stop-loss: recommended or 3.5% below entry
  const defaultStop = recommendedStopPrice && recommendedStopPrice < entryPrice
    ? recommendedStopPrice
    : Number((entryPrice * 0.965).toFixed(2));

  const [stopLossPrice, setStopLossPrice] = useState<number>(defaultStop);
  const [targetRatio, setTargetRatio] = useState<number>(2.5); // 2.5:1 R:R

  // Keep entry synced when currentPrice changes if user hasn't typed a custom value
  React.useEffect(() => {
    if (currentPrice > 0 && entryPrice === 100) {
      setEntryPrice(currentPrice);
      setStopLossPrice(
        recommendedStopPrice && recommendedStopPrice < currentPrice
          ? recommendedStopPrice
          : Number((currentPrice * 0.965).toFixed(2))
      );
    }
  }, [currentPrice, recommendedStopPrice, entryPrice]);

  // Calculations
  const maxRiskDollars = (accountEquity * riskPercent) / 100;
  const monthlyCircuitBreaker = (accountEquity * 6) / 100; // 6% Rule

  const riskPerUnit = Math.max(0.01, entryPrice - stopLossPrice);
  const stopDistancePct = ((entryPrice - stopLossPrice) / entryPrice) * 100;

  // Position Sizing: Number of units / shares / coins
  const unitsToBuy = riskPerUnit > 0 ? maxRiskDollars / riskPerUnit : 0;
  const positionSizeUsd = unitsToBuy * entryPrice;
  const portfolioAllocationPct = accountEquity > 0 ? (positionSizeUsd / accountEquity) * 100 : 0;

  // Target profit
  const targetProfitPrice = entryPrice + riskPerUnit * targetRatio;
  const expectedProfitDollars = maxRiskDollars * targetRatio;

  const isBtc = symbol.toUpperCase().includes('BTC');

  return (
    <div className="bg-[#0B0F17] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
      {/* ─── HEADER ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#080C14] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white tracking-wider">
                DR. ELDER’S 2% & 6% RISK MANAGEMENT COCKPIT
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                Capital Preservation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact position sizing formula designed to eliminate account blowups and emotional revenge trading
            </p>
          </div>
        </div>

        {/* 6% Rule Monthly Circuit Breaker Badge */}
        <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-xs font-mono text-amber-300 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>6% Monthly Loss Cap: <strong>${monthlyCircuitBreaker.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* ─── INTERACTIVE CALCULATOR GRID ─── */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Trade Parameters
          </h4>

          {/* Account Equity */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>Total Account Equity ($):</span>
              <span className="font-bold text-white">${accountEquity.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={100}
                step={500}
                value={accountEquity}
                onChange={(e) => setAccountEquity(Math.max(100, parseFloat(e.target.value) || 0))}
                className="flex-1 bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
              {/* Presets */}
              {[5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAccountEquity(amt)}
                  className={`px-2 py-2 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    accountEquity === amt
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  ${amt / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Entry & Stop-Loss */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Entry Price ($):
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070A11] border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Stop-Loss Price ($):
              </label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070A11] border border-rose-900/60 rounded-xl px-3 py-2 text-sm font-mono text-rose-300 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Stop distance visual note */}
          <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
            <span>Stop Distance:</span>
            <span className="font-bold text-rose-400">
              -{stopDistancePct.toFixed(2)}% (${riskPerUnit.toFixed(2)} / unit)
            </span>
          </div>

          {/* Target Ratio (R:R) */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>Target Risk:Reward Ratio:</span>
              <span className="font-bold text-emerald-400">{targetRatio.toFixed(1)} : 1</span>
            </div>
            <div className="flex gap-2">
              {[1.5, 2.0, 2.5, 3.0].map((rr) => (
                <button
                  key={rr}
                  type="button"
                  onClick={() => setTargetRatio(rr)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    targetRatio === rr
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {rr}R
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Exact Elder Outputs */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Execution Sizing Directives
          </h4>

          {/* Core Calculation Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* 2% Max Risk */}
            <div className="p-3.5 rounded-xl bg-[#070A11] border border-emerald-500/40">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                The 2% Rule (Max Loss)
              </span>
              <div className="text-xl font-black font-mono text-emerald-400">
                ${maxRiskDollars.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Maximum allowed equity loss on this specific trade.
              </span>
            </div>

            {/* Position Size ($) */}
            <div className="p-3.5 rounded-xl bg-[#070A11] border border-cyan-500/40">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Calculated Position Sizing
              </span>
              <div className="text-xl font-black font-mono text-cyan-300">
                ${positionSizeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {portfolioAllocationPct.toFixed(1)}% of total account capital.
              </span>
            </div>

            {/* Units to Buy */}
            <div className="p-3.5 rounded-xl bg-[#070A11] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Units / Contracts
              </span>
              <div className="text-lg font-black font-mono text-white">
                {unitsToBuy > 10 ? unitsToBuy.toFixed(2) : unitsToBuy.toFixed(4)} {isBtc ? 'BTC' : 'SPY'}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Exact units to purchase with stop @ ${stopLossPrice.toLocaleString()}.
              </span>
            </div>

            {/* Target Take-Profit */}
            <div className="p-3.5 rounded-xl bg-[#070A11] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Take-Profit Price ({targetRatio}R)
              </span>
              <div className="text-lg font-black font-mono text-emerald-300">
                ${targetProfitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">
                +${expectedProfitDollars.toFixed(2)} expected gain.
              </span>
            </div>
          </div>

          {/* Dr. Elder Rule Summary Banner */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-white block mb-0.5 font-mono">Dr. Alexander Elder Doctrine:</strong>
            &ldquo;If a trade hits your stop-loss, you lose exactly 2% ($
            {maxRiskDollars.toFixed(2)}). You would have to suffer 50 consecutive losing trades to wipe out your capital.
            If your monthly losses reach 6% (${monthlyCircuitBreaker.toLocaleString()}), stop trading immediately for the rest of the month.&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
}

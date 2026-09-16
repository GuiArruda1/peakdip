'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function BrainExpectancySimulator() {
  const [winRate, setWinRate] = useState<number>(45); // 45% default
  const [avgWinR, setAvgWinR] = useState<number>(2.0); // 2.0R default
  const [avgLossR, setAvgLossR] = useState<number>(1.0); // 1.0R default
  const [tradeCount, setTradeCount] = useState<number>(20); // 20 trades sample
  const [accountSize, setAccountSize] = useState<number>(1000); // $1,000 default
  const [riskPerTradePct, setRiskPerTradePct] = useState<number>(2.0); // 2% risk

  // Calculations
  const stats = useMemo(() => {
    const pWin = winRate / 100;
    const pLoss = 1 - pWin;
    const expectancyR = pWin * avgWinR - pLoss * avgLossR;
    const totalExpectedR = expectancyR * tradeCount;

    const riskDollar = accountSize * (riskPerTradePct / 100);
    const expectedDollarPnL = totalExpectedR * riskDollar;
    const projectedEndingBalance = Math.max(0, accountSize + expectedDollarPnL);

    // Breakeven win rate: BE = AvgLoss / (AvgWin + AvgLoss)
    const breakevenWinRate = (avgLossR / (avgWinR + avgLossR)) * 100;

    return {
      expectancyR: Math.round(expectancyR * 100) / 100,
      totalExpectedR: Math.round(totalExpectedR * 10) / 10,
      riskDollar: Math.round(riskDollar),
      expectedDollarPnL: Math.round(expectedDollarPnL),
      projectedEndingBalance: Math.round(projectedEndingBalance),
      breakevenWinRate: Math.round(breakevenWinRate * 10) / 10,
      isPositive: expectancyR > 0,
    };
  }, [winRate, avgWinR, avgLossR, tradeCount, accountSize, riskPerTradePct]);

  // Drawdown recovery table data
  const drawdownTable = [
    { loss: 10, gainNeeded: 11.1, difficulty: 'Manageable' },
    { loss: 20, gainNeeded: 25.0, difficulty: 'Moderate' },
    { loss: 30, gainNeeded: 42.9, difficulty: 'Challenging' },
    { loss: 50, gainNeeded: 100.0, difficulty: 'Extreme (Must 2x Account)' },
    { loss: 75, gainNeeded: 300.0, difficulty: 'Critical (Must 4x Account)' },
    { loss: 90, gainNeeded: 900.0, difficulty: 'Near Impossible' },
  ];

  return (
    <div className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-white tracking-wide">
              MATHEMATICAL EXPECTANCY & COMPOUNDING SIMULATOR
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {'Douglas & PTJ Formula: E = (Win% × AvgWin) - (Loss% × AvgLoss)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            stats.isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {stats.isPositive ? 'POSITIVE EXPECTANCY (+EDGE)' : 'NEGATIVE EXPECTANCY (-BLEED)'}
          </span>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate Slider */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Win Rate (W%)</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{winRate}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={80}
            step={1}
            value={winRate}
            onChange={(e) => setWinRate(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>20%</span>
            <span>50%</span>
            <span>80%</span>
          </div>
        </div>

        {/* Avg Win R Slider */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Avg Win (R)</span>
            <span className="text-sm font-mono font-bold text-cyan-400">+{avgWinR}R</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={5.0}
            step={0.1}
            value={avgWinR}
            onChange={(e) => setAvgWinR(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>1.0R</span>
            <span>3.0R</span>
            <span>5.0R (PTJ)</span>
          </div>
        </div>

        {/* Sample Trades Slider */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Sample Batch</span>
            <span className="text-sm font-mono font-bold text-amber-400">{tradeCount} Trades</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={tradeCount}
            onChange={(e) => setTradeCount(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>10</span>
            <span>20 (Douglas)</span>
            <span>100</span>
          </div>
        </div>

        {/* Account Size & Risk Input */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Capital & Risk</span>
            <span className="text-xs font-mono font-bold text-purple-300">
              ${accountSize} @ {riskPerTradePct}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(Math.max(10, Number(e.target.value)))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              placeholder="Balance"
            />
            <input
              type="number"
              step={0.5}
              min={0.5}
              max={5}
              value={riskPerTradePct}
              onChange={(e) => setRiskPerTradePct(Math.max(0.5, Math.min(10, Number(e.target.value))))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              placeholder="Risk %"
            />
          </div>
        </div>
      </div>

      {/* Expectancy Results Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Expectancy per Trade (E)</span>
          <span className={`text-2xl font-mono font-black mt-1 block ${
            stats.expectancyR >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {stats.expectancyR >= 0 ? '+' : ''}{stats.expectancyR}R
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Breakeven req: {stats.breakevenWinRate}% win rate
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Expected R</span>
          <span className={`text-2xl font-mono font-black mt-1 block ${
            stats.totalExpectedR >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {stats.totalExpectedR >= 0 ? '+' : ''}{stats.totalExpectedR}R
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            across {tradeCount} executed setups
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Expected Dollar Return</span>
          <span className={`text-2xl font-mono font-black mt-1 block ${
            stats.expectedDollarPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {stats.expectedDollarPnL >= 0 ? '+' : ''}${stats.expectedDollarPnL.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            based on ${stats.riskDollar} risk/trade (1R)
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Projected Balance</span>
          <span className="text-2xl font-mono font-black text-white mt-1 block">
            ${stats.projectedEndingBalance.toLocaleString()}
          </span>
          <span className={`text-[10px] font-mono font-bold ${
            stats.expectedDollarPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {stats.expectedDollarPnL >= 0 ? '+' : ''}
            {Math.round((stats.expectedDollarPnL / accountSize) * 100)}% total return
          </span>
        </div>
      </div>

      {/* Drawdown Recovery Reality Check */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            DRAWDOWN RECOVERY REALITY CHECK (WHY CUTTING LOSSES IS NON-NEGOTIABLE)
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Losses grow linearly, but the mathematical gain required to get back to breakeven grows exponentially. This is why Tom Hougaard warns that refusing to cut small losses guarantees eventual account destruction.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {drawdownTable.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                item.loss >= 50
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : item.loss >= 30
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Drawdown</span>
                <span className="text-base font-mono font-black">-{item.loss}%</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-400 block">Gain Required</span>
                <span className="text-xs font-mono font-bold text-emerald-400">+{item.gainNeeded}%</span>
                <span className="text-[8px] font-mono block mt-0.5 text-slate-400 truncate">
                  {item.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

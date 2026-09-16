'use client';

import React, { useState } from 'react';
import { DayTradeSetup } from '@/lib/types';
import { Calculator, ShieldAlert, ArrowUpRight, DollarSign, Percent } from 'lucide-react';

interface DayTradeRiskCalculatorProps {
  setup: DayTradeSetup | null;
  currentPrice: number;
}

export default function DayTradeRiskCalculator({ setup, currentPrice }: DayTradeRiskCalculatorProps) {
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [leverage, setLeverage] = useState<number>(5);

  const entry = setup ? setup.entryPrice : currentPrice;
  const stopLoss = setup ? setup.stopLoss : entry * 0.992;
  const tp1 = setup ? setup.takeProfit1 : entry * 1.012;
  const tp2 = setup ? setup.takeProfit2 : entry * 1.02;

  const isLong = setup ? setup.direction === 'LONG' : true;
  const priceRiskPerUnit = Math.abs(entry - stopLoss);
  const riskDollarAmount = (accountSize * riskPct) / 100;

  // Position units = Dollar Risk / (Price Risk per unit)
  const units = priceRiskPerUnit > 0 ? riskDollarAmount / priceRiskPerUnit : 0;
  const totalPositionValue = units * entry;
  const marginRequired = leverage > 0 ? totalPositionValue / leverage : totalPositionValue;

  const profitTp1 = units * Math.abs(tp1 - entry);
  const profitTp2 = units * Math.abs(tp2 - entry);

  const riskPctOfMargin = marginRequired > 0 ? (riskDollarAmount / marginRequired) * 100 : 0;

  return (
    <div className="rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-2xl p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Day Trade Risk & Position Calculator</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {setup ? setup.setupName : 'Manual Sizing'}
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">
              Account Capital ($):
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-500 font-mono text-xs">$</span>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(Math.max(100, Number(e.target.value)))}
                className="w-full bg-[#06080E] border border-slate-800 rounded-lg pl-7 pr-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">
              Risk Tolerance (%):
            </label>
            <div className="flex gap-1">
              {[0.5, 1.0, 2.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setRiskPct(pct)}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] font-semibold border transition-all ${
                    riskPct === pct
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-[#06080E] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">
              Execution Leverage:
            </label>
            <div className="flex gap-1">
              {[1, 5, 10, 20].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] font-semibold border transition-all ${
                    leverage === lev
                      ? 'bg-blue-950 border-blue-600 text-blue-300'
                      : 'bg-[#06080E] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Results Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#06080E] border border-slate-800/80 font-mono">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Max Risk ($):</span>
            <span className="text-sm font-bold text-rose-400">
              ${riskDollarAmount.toFixed(2)}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {riskPct}% of balance
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Position Size:</span>
            <span className="text-sm font-bold text-white">
              ${totalPositionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {units.toFixed(4)} Units
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Required Margin:</span>
            <span className="text-sm font-bold text-blue-400">
              ${marginRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] text-slate-400 block">
              @ {leverage}x leverage
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
            <span className="text-[10px] text-slate-400 block">TP1 / TP2 Gain:</span>
            <span className="text-sm font-bold text-emerald-400">
              +${profitTp1.toFixed(0)} / +${profitTp2.toFixed(0)}
            </span>
            <span className="text-[9px] text-emerald-500 block">
              Up to +{(profitTp2 / riskDollarAmount).toFixed(1)}x R:R
            </span>
          </div>
        </div>
      </div>

      {/* Safety Advisory Footer */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          Always place hard stop-loss orders at <strong>${stopLoss}</strong> upon entry. Never risk more than 2% of total capital per scalp.
        </span>
      </div>
    </div>
  );
}

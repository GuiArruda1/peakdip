'use client';

import React from 'react';
import { BacktestResult } from '@/lib/types';
import { History, ShieldAlert, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

interface BacktestMetricsProps {
  backtest: BacktestResult | null;
  loading: boolean;
}

export default function BacktestMetrics({ backtest, loading }: BacktestMetricsProps) {
  if (loading || !backtest) {
    return (
      <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const {
    symbol,
    totalSignals,
    winRate7d,
    avgReturn7d,
    winRate30d,
    avgReturn30d,
    winRate90d,
    avgReturn90d,
    maxDrawdownAvg,
    recentTriggers,
  } = backtest;

  return (
    <div className="bg-[#0F1420] border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <History className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Historical Signal Backtest & Forward Return Engine
            </h3>
            <p className="text-xs text-slate-400">
              Walk-forward evaluation of returns following verified dip triggers
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50">
          {totalSignals} Verified Historical Dips
        </span>
      </div>

      {/* KPI Performance Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        {/* 7-Day Performance */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            +7-Day Forward Return
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-black ${
                avgReturn7d >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {avgReturn7d > 0 ? '+' : ''}
              {avgReturn7d}%
            </span>
            <span className="text-xs font-mono text-slate-400">avg</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-300 flex justify-between">
            <span className="text-slate-400">Win Rate:</span>
            <span className="font-bold text-emerald-400">{winRate7d}%</span>
          </div>
        </div>

        {/* 30-Day Performance */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            +30-Day Forward Return
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-black ${
                avgReturn30d >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {avgReturn30d > 0 ? '+' : ''}
              {avgReturn30d}%
            </span>
            <span className="text-xs font-mono text-slate-400">avg</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-300 flex justify-between">
            <span className="text-slate-400">Win Rate:</span>
            <span className="font-bold text-emerald-400">{winRate30d}%</span>
          </div>
        </div>

        {/* 90-Day Performance */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            +90-Day Forward Return
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-black ${
                avgReturn90d >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {avgReturn90d > 0 ? '+' : ''}
              {avgReturn90d}%
            </span>
            <span className="text-xs font-mono text-slate-400">avg</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-300 flex justify-between">
            <span className="text-slate-400">Win Rate:</span>
            <span className="font-bold text-emerald-400">{winRate90d}%</span>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Avg Adverse Drawdown
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-amber-400">
              {maxDrawdownAvg}%
            </span>
            <span className="text-xs font-mono text-slate-400">during 30d</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended stop ~1.5x</span>
          </div>
        </div>
      </div>

      {/* Recent Historical Dip Triggers Table */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
          Recent Historical Dip Triggers & Outcomes ({symbol})
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#080B11]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Price at Dip</th>
                <th className="py-2.5 px-3">Conviction</th>
                <th className="py-2.5 px-3">+7d Return</th>
                <th className="py-2.5 px-3">+30d Return</th>
                <th className="py-2.5 px-3">+90d Return</th>
                <th className="py-2.5 px-3">Max DD</th>
                <th className="py-2.5 px-3 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {recentTriggers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No recent triggers evaluated.
                  </td>
                </tr>
              ) : (
                recentTriggers.map((t, idx) => {
                  const isWin = t.return30d > 0;
                  return (
                    <tr
                      key={idx}
                      className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-white">{t.date}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        ${t.priceAtSignal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                          {t.compositeScore}%
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          t.return7d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.return7d > 0 ? '+' : ''}
                        {t.return7d}%
                      </td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          t.return30d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.return30d > 0 ? '+' : ''}
                        {t.return30d}%
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          t.return90d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.return90d > 0 ? '+' : ''}
                        {t.return90d}%
                      </td>
                      <td className="py-2.5 px-3 text-amber-400">{t.maxDrawdown}%</td>
                      <td className="py-2.5 px-3 text-right">
                        {isWin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>WIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>LOSS</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

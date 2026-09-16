'use client';

import React from 'react';
import { SeasonalityMatrixData } from '@/lib/types';
import { Calendar, TrendingUp, Info } from 'lucide-react';

interface SeasonalityMatrixProps {
  seasonality: SeasonalityMatrixData | null;
  loading: boolean;
}

const MONTH_HEADERS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SeasonalityMatrix({ seasonality, loading }: SeasonalityMatrixProps) {
  if (loading || !seasonality) {
    return (
      <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-52 bg-slate-800 rounded mb-4"></div>
        <div className="h-48 bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  const { symbol, weekdays, monthlyHeatmap, monthlyAverages, insights } = seasonality;
  const isCrypto = symbol.toUpperCase().includes('BTC');

  // Filter weekdays: for equities, show Mon-Fri; for crypto, show all 7 days
  const displayWeekdays = isCrypto ? weekdays : weekdays.filter((w) => w.dayNumber >= 1 && w.dayNumber <= 5);

  return (
    <div className="bg-[#0F1420] border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Seasonality & Calendar Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Historical Day-of-Week win rates & 12-month return patterns
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-[#080B11] px-3 py-1.5 rounded-lg border border-slate-800">
          Sample: {monthlyHeatmap.length} Years Historical Series
        </span>
      </div>

      {/* Weekday Performance Cards */}
      <div className="my-6">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
          Day-of-Week Performance & Dip Windows
        </h4>

        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${isCrypto ? '7' : '5'} gap-2.5`}>
          {displayWeekdays.map((day) => {
            const isWinRateHigh = day.winRatePct >= 52.0;
            return (
              <div
                key={day.dayNumber}
                className={`p-3 rounded-xl border transition-all ${
                  day.isFavorableEntry
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm shadow-emerald-950/50'
                    : 'bg-[#080B11] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    {day.dayName.substring(0, 3)}
                  </span>
                  {day.isFavorableEntry && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-emerald-300 bg-emerald-900/60 rounded">
                      Prime Dip
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Win Rate:</span>
                    <span className={`font-bold ${isWinRateHigh ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {day.winRatePct}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Avg Return:</span>
                    <span
                      className={`font-semibold ${
                        day.avgReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {day.avgReturnPct > 0 ? '+' : ''}
                      {day.avgReturnPct}%
                    </span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400 text-[10px]">Med. Dip:</span>
                    <span className="text-slate-300 text-[10px]">
                      {day.medianDrawdownPct}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[9px] font-mono text-slate-400 line-clamp-2 leading-tight">
                  {day.notes}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Returns Heatmap Grid */}
      <div className="my-6">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
          12-Month Historical Return Heatmap (Year × Month)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#080B11]">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3 text-left font-bold">Year</th>
                {MONTH_HEADERS.map((m) => (
                  <th key={m} className="py-2.5 px-1.5 font-bold">
                    {m}
                  </th>
                ))}
                <th className="py-2.5 px-3 font-bold text-white">YTD</th>
              </tr>
            </thead>
            <tbody>
              {monthlyHeatmap.slice(0, 6).map((row) => (
                <tr key={row.year} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="py-2 px-3 text-left font-bold text-slate-300">{row.year}</td>
                  {MONTH_HEADERS.map((_, idx) => {
                    const monthNum = idx + 1;
                    const val = row.returns[monthNum];
                    if (val === null || val === undefined) {
                      return (
                        <td key={monthNum} className="py-2 px-1 text-slate-600">
                          —
                        </td>
                      );
                    }
                    const isPositive = val >= 0;
                    return (
                      <td
                        key={monthNum}
                        className={`py-2 px-1 font-semibold ${
                          isPositive
                            ? val > 10
                              ? 'bg-emerald-950/70 text-emerald-300 font-bold'
                              : 'text-emerald-400'
                            : val < -10
                            ? 'bg-rose-950/70 text-rose-300 font-bold'
                            : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {val.toFixed(1)}%
                      </td>
                    );
                  })}
                  <td
                    className={`py-2 px-3 font-bold ${
                      row.annualReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {row.annualReturn > 0 ? '+' : ''}
                    {row.annualReturn}%
                  </td>
                </tr>
              ))}

              {/* Monthly Averages Row */}
              <tr className="bg-slate-900/90 font-bold text-[11px] border-t-2 border-slate-700">
                <td className="py-2.5 px-3 text-left text-white">AVG</td>
                {monthlyAverages.map((m) => {
                  const isPositive = m.avgReturnPct >= 0;
                  return (
                    <td
                      key={m.monthNumber}
                      className={`py-2.5 px-1 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {m.avgReturnPct}%
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 text-white">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Insights Box */}
      {insights.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#080B11] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Key Seasonality Findings</span>
          </div>
          {insights.map((ins, i) => (
            <p key={i} className="text-xs text-slate-300 font-mono pl-6 leading-relaxed">
              • {ins}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

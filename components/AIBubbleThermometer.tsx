'use client';

import React, { useState, useEffect } from 'react';
import {
  BubbleThermometerPayload,
  TechShareThermometer,
  BubbleTemperatureZone,
} from '@/lib/types';
import ComponentPillTip from './ComponentPillTip';
import {
  Thermometer,
  Flame,
  Snowflake,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export default function AIBubbleThermometer() {
  const [data, setData] = useState<BubbleThermometerPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState<TechShareThermometer | null>(null);
  const [filter, setFilter] = useState<'all' | 'dips' | 'froth'>('all');

  const loadData = async (forceSync = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bubble-thermometer${forceSync ? '?sync=true' : ''}`);
      if (res.ok) {
        const json: BubbleThermometerPayload = await res.json();
        setData(json);
        if (json.shares.length > 0) {
          setSelectedShare((prev) => {
            if (prev && json.shares.some((s) => s.symbol === prev.symbol)) {
              return json.shares.find((s) => s.symbol === prev.symbol)!;
            }
            return json.shares[0];
          });
        }
      }
    } catch (err) {
      console.error('Failed to load bubble thermometer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);

    // Auto-refresh tech shares every 60,000ms (60 seconds) in background
    const interval = setInterval(() => {
      loadData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const macroTemp = data?.macroTemperature ?? 50;

  // Filtered shares
  const filteredShares = (data?.shares || []).filter((s) => {
    if (filter === 'dips') return s.temperature <= 50;
    if (filter === 'froth') return s.temperature >= 75;
    return true;
  });

  return (
    <div className="rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-2xl p-4 sm:p-6 w-full max-w-full overflow-hidden">
      {/* Header & Explanation Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-cyan-500/20 border border-slate-700">
              <Thermometer className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>AI Bubble Thermometer</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-700/50 text-rose-300">
                  S&P 500 Tech Froth
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Evaluates 200-SMA overextension, RSI momentum, and 52-week highs to time entries and exits on top US tech shares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ComponentPillTip
            layer="EQUITY FROTH"
            title="Bubble Thermometer"
            liveStatus={`Sector Temp: ${macroTemp}°C • ${data?.macroLabel || 'CALCULATING'}`}
            summary="Continuous quantitative froth meter for the S&P 500 Magnificent 7 and semiconductor titans. It scores 0° to 100° across 4 metrics (200-SMA stretch, RSI heat, 52-week ATH proximity, and 90d velocity) to prevent buying market tops and identify asymmetric dip reloads."
            howToRead={[
              "0°–25° (❄️ Freezing): Deep value capitulation discount. Optimal risk-reward for aggressive scaling in.",
              "26°–50° (🍃 Cool): Healthy technical pullback near moving averages. Safe dollar-cost averaging window.",
              "51°–74° (☀️ Temperate): Equilibrium momentum. Hold existing longs with a trailing stop under 50-SMA.",
              "75°–89° (🔥 Warm Froth): Overextended valuation. Trim 25%–50% profits and tighten stop-losses.",
              "90°–100° (🌋 Boiling): Parabolic mania. Extreme mean-reversion risk. Avoid fresh longs; protect capital."
            ]}
            theme="amber"
          />

          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-[#06080E] hover:bg-slate-800 border border-slate-800 rounded-xl transition-all disabled:opacity-50 shrink-0"
            title="Refresh tech shares data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Main Visual Thermometer Display & Sector Thesis */}
      <div className="my-6 p-4 sm:p-5 rounded-2xl bg-[#06080E] border border-slate-800/90 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-20"
          style={{ backgroundColor: data?.macroColor || '#38BDF8' }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Interactive Liquid Mercury Tube */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Thermometer Glass Structure */}
            <div className="flex flex-col items-center">
              {/* Glass Tube Stem */}
              <div className="relative w-7 sm:w-8 h-36 bg-[#0B0F17] rounded-t-full border-2 border-slate-700/80 p-0.5 overflow-hidden shadow-inner flex flex-col justify-end">
                {/* Temperature Graduations / Tick Marks */}
                <div className="absolute inset-y-2 right-1 flex flex-col justify-between text-[7px] font-mono text-slate-400 pointer-events-none z-10">
                  <span>100°</span>
                  <span>75°</span>
                  <span>50°</span>
                  <span>25°</span>
                  <span>0°</span>
                </div>

                {/* Animated Rising Liquid Column */}
                <div
                  className="w-full rounded-t-full transition-all duration-1000 ease-out relative"
                  style={{
                    height: `${Math.max(8, macroTemp)}%`,
                    background:
                      macroTemp > 75
                        ? 'linear-gradient(to top, #F59E0B, #EF4444)'
                        : macroTemp > 50
                        ? 'linear-gradient(to top, #06B6D4, #F59E0B)'
                        : 'linear-gradient(to top, #10B981, #06B6D4)',
                    boxShadow: `0 0 15px ${data?.macroColor || '#38BDF8'}80`,
                  }}
                >
                  {/* Subtle animated bubble inside column */}
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/60 animate-ping" />
                </div>
              </div>

              {/* Glowing Mercury Bulb */}
              <div
                className="relative -mt-1.5 w-12 h-12 rounded-full border-2 border-slate-700/90 flex items-center justify-center shadow-lg transition-all"
                style={{
                  background:
                    macroTemp > 75
                      ? 'radial-gradient(circle, #EF4444 20%, #991B1B 80%)'
                      : macroTemp > 50
                      ? 'radial-gradient(circle, #F59E0B 20%, #B45309 80%)'
                      : 'radial-gradient(circle, #10B981 20%, #065F46 80%)',
                  boxShadow: `0 0 20px ${data?.macroColor || '#10B981'}70`,
                }}
              >
                {macroTemp > 75 ? (
                  <Flame className="w-5 h-5 text-white animate-pulse" />
                ) : macroTemp < 30 ? (
                  <Snowflake className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
                ) : (
                  <Thermometer className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {/* Readout & Status Description */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-3xl sm:text-4xl font-black tracking-tight"
                  style={{ color: data?.macroColor || '#38BDF8' }}
                >
                  {macroTemp}°C
                </span>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-black uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${data?.macroColor || '#38BDF8'}20`,
                    color: data?.macroColor || '#38BDF8',
                    borderColor: `${data?.macroColor || '#38BDF8'}50`,
                  }}
                >
                  {data?.macroLabel || 'ANALYZING'}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                S&P 500 Tech Sector Composite Heat
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                {data?.macroSummary}
              </p>
            </div>
          </div>

          {/* Right: Froth Spectrum Scale Guide */}
          <div className="flex flex-col gap-1.5 font-mono text-[10px] w-full lg:w-72 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Froth Spectrum Decision Guide
            </span>
            <div className="grid grid-cols-5 gap-1 text-center font-bold">
              <div className="p-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                0-25°<br/><span className="text-[8px] font-normal">DIP BUY</span>
              </div>
              <div className="p-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800">
                26-50°<br/><span className="text-[8px] font-normal">ACCUM</span>
              </div>
              <div className="p-1 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
                51-74°<br/><span className="text-[8px] font-normal">HOLD</span>
              </div>
              <div className="p-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
                75-89°<br/><span className="text-[8px] font-normal">TRIM</span>
              </div>
              <div className="p-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800">
                90°+<br/><span className="text-[8px] font-normal">BUBBLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Share Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 bg-[#06080E] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            All Megacaps ({data?.shares.length ?? 0})
          </button>
          <button
            onClick={() => setFilter('dips')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 ${
              filter === 'dips'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-emerald-300" />
            <span>Best Dips (&le;50°)</span>
          </button>
          <button
            onClick={() => setFilter('froth')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 ${
              filter === 'froth'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-300" />
            <span>Overheated (&ge;75°)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Updated: {data?.lastUpdated || 'Live'}
        </span>
      </div>

      {/* Tech Shares Bubble Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 min-w-0">
        {filteredShares.map((stock) => {
          const isSelected = selectedShare?.symbol === stock.symbol;
          const isPositive = stock.priceChange24h >= 0;

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelectedShare(stock)}
              className={`cursor-pointer rounded-2xl p-4 transition-all border relative overflow-hidden flex flex-col justify-between select-none ${
                isSelected
                  ? 'bg-[#0B1220] border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'bg-[#06080E] border-slate-800/80 hover:border-slate-700 hover:bg-[#080D18]'
              }`}
            >
              <div>
                {/* Stock Card Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-white">
                        {stock.symbol}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{stock.priceChange24h}%
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 block truncate">
                      {stock.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-mono font-bold text-white">
                      ${stock.currentPrice.toFixed(2)}
                    </div>
                    {/* Temperature Pill */}
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black mt-0.5 border"
                      style={{
                        backgroundColor: `${stock.zoneColor}20`,
                        color: stock.zoneColor,
                        borderColor: `${stock.zoneColor}50`,
                      }}
                    >
                      <span>{stock.temperature}°C</span>
                      <span className="text-[8px] font-semibold">({stock.temperature <= 50 ? '❄️' : stock.temperature >= 75 ? '🔥' : '☀️'})</span>
                    </div>
                  </div>
                </div>

                {/* Thermometer Mini Meter */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400">{stock.zoneLabel}</span>
                    <span className="font-bold" style={{ color: stock.zoneColor }}>
                      {stock.temperature}/100 Heat
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(5, stock.temperature)}%`,
                        backgroundColor: stock.zoneColor,
                        boxShadow: `0 0 10px ${stock.zoneColor}80`,
                      }}
                    />
                  </div>
                </div>

                {/* Analytical Drivers */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 p-2 rounded-xl bg-[#080B12] border border-slate-800/80 font-mono text-center">
                  <div className="min-w-0">
                    <span className="text-[8px] text-slate-400 block uppercase truncate">200 SMA</span>
                    <span
                      className={`text-[10px] font-bold truncate block ${
                        stock.distanceToSma200Pct > 20
                          ? 'text-rose-400'
                          : stock.distanceToSma200Pct < 0
                          ? 'text-emerald-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {stock.distanceToSma200Pct >= 0 ? '+' : ''}{stock.distanceToSma200Pct}%
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[8px] text-slate-400 block uppercase truncate">RSI(14)</span>
                    <span
                      className={`text-[10px] font-bold truncate block ${
                        stock.rsi14 > 70
                          ? 'text-rose-400'
                          : stock.rsi14 < 35
                          ? 'text-emerald-400'
                          : 'text-cyan-300'
                      }`}
                    >
                      {stock.rsi14}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[8px] text-slate-400 block uppercase truncate">52w ATH</span>
                    <span className="text-[10px] font-bold text-slate-300 truncate block">
                      {stock.drawdown52wPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Decision Pill */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider border shadow-sm"
                  style={{
                    backgroundColor: `${stock.decision.color}20`,
                    color: stock.decision.color,
                    borderColor: `${stock.decision.color}50`,
                  }}
                >
                  {stock.decision.label}
                </span>

                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  {isSelected ? 'Viewing Plan ✓' : 'Plan →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Share Action Plan Deep-Dive Drawer */}
      {selectedShare && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#06080E] border border-cyan-500/50 shadow-2xl relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-white text-base shadow-lg"
                style={{ backgroundColor: `${selectedShare.decision.color}30`, border: `1px solid ${selectedShare.decision.color}60` }}
              >
                {selectedShare.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-base font-bold text-white">
                    {selectedShare.symbol} — {selectedShare.name}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `${selectedShare.zoneColor}25`, color: selectedShare.zoneColor }}
                  >
                    {selectedShare.temperature}°C Heat
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live Price: <strong className="text-white">${selectedShare.currentPrice.toFixed(2)}</strong> • AI Action Decision: <strong style={{ color: selectedShare.decision.color }}>{selectedShare.decision.label}</strong>
                </p>
              </div>
            </div>

            {/* Target Execution Levels */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-[#090D16] p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[8px] text-rose-400 block uppercase">Stop Loss</span>
                <span className="font-bold text-rose-400">${selectedShare.decision.invalidationPrice}</span>
              </div>
              <div>
                <span className="text-[8px] text-emerald-400 block uppercase">Target 1</span>
                <span className="font-bold text-emerald-400">${selectedShare.decision.targetPrice1}</span>
              </div>
              <div>
                <span className="text-[8px] text-cyan-400 block uppercase">Target 2</span>
                <span className="font-bold text-cyan-400">${selectedShare.decision.targetPrice2}</span>
              </div>
            </div>
          </div>

          {/* Quantitative Decision Rationale */}
          <div className="mt-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Institutional Mathematical Thesis:
            </span>
            <ul className="space-y-1.5">
              {selectedShare.decision.rationale.map((r, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">▸</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  DayTradePayload,
  DayTradeSetup,
  DayTradeTimeframe,
} from '@/lib/types';
import DayTradeChart from './DayTradeChart';
import DayTradeRiskCalculator from './DayTradeRiskCalculator';
import ComponentPillTip from './ComponentPillTip';
import HeitkoetterGoldenEngine from './HeitkoetterGoldenEngine';
import {
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  RefreshCw,
  Activity,
  Compass,
  AlertCircle,
  Radio,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface DayTradeTerminalProps {
  onBackToSwing?: () => void;
}

const SUPPORTED_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', tag: 'CRYPTO' },
  { symbol: 'ETHUSDT', name: 'Ethereum', tag: 'CRYPTO' },
  { symbol: 'SOLUSDT', name: 'Solana', tag: 'CRYPTO' },
  { symbol: 'SPY', name: 'S&P 500 ETF', tag: 'INDEX' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', tag: 'INDEX' },
];

const TIMEFRAMES: DayTradeTimeframe[] = ['1m', '5m', '15m', '1h'];

export default function DayTradeTerminal({ onBackToSwing }: DayTradeTerminalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<DayTradeTimeframe>('5m');
  const [data, setData] = useState<DayTradePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSetup, setActiveSetup] = useState<DayTradeSetup | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch(
          `/api/daytrade?symbol=${selectedSymbol}&timeframe=${selectedTimeframe}`
        );
        if (res.ok) {
          const json: DayTradePayload = await res.json();
          setData(json);
          setLastRefreshed(new Date().toLocaleTimeString());

          // Select first setup if available or retain previous
          if (json.setups && json.setups.length > 0) {
            setActiveSetup((prev) => {
              if (prev && json.setups.some((s) => s.id === prev.id)) {
                return json.setups.find((s) => s.id === prev.id)!;
              }
              return json.setups[0];
            });
          } else {
            setActiveSetup(null);
          }
        }
      } catch (e) {
        console.error('Failed to load day trade data:', e);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [selectedSymbol, selectedTimeframe]
  );

  useEffect(() => {
    loadData(true);

    // Live fast poll every 15 seconds for intraday scalping
    const interval = setInterval(() => {
      loadData(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData]);

  const currentPrice = data?.currentPrice ?? 0;
  const isPositive = (data?.priceChangePct ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Intraday Command Bar */}
      <div className="rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Asset & Timeframe Selectors */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 bg-[#06080E] p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {SUPPORTED_ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedSymbol === asset.symbol
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="hidden sm:inline">{asset.name}</span>
                  <span className="text-xs sm:text-[9px] sm:opacity-70 font-mono">{asset.symbol.replace('USDT', '')}</span>
                </button>
              ))}
            </div>

            {/* Timeframe Pill Switcher */}
            <div className="flex items-center gap-1 bg-[#06080E] p-1 rounded-xl border border-slate-800">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Session Radar & Live Clock */}
          <div className="flex flex-wrap items-center gap-3">
            {data?.session && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#06080E] border border-slate-800 font-mono text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-slate-300 font-semibold">{data.session.sessionName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    data.session.volatilityTier === 'EXTREME'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : data.session.volatilityTier === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {data.session.volatilityTier} VOL
                </span>
              </div>
            )}

            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-[#06080E] hover:bg-slate-800 border border-slate-800 rounded-xl transition-all disabled:opacity-50"
              title="Refresh intraday book"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">15s Live</span>
            </button>
          </div>
        </div>

        {/* Intraday Metrics Quick Ribbon */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-800/80 font-mono">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/60 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Price</span>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                ${data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold block truncate ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{data.priceChangePct}%
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/60 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Session VWAP</span>
              <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5 truncate">
                ${data.indicators.currentVwap.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                {data.indicators.distToVwapPct >= 0 ? '+' : ''}{data.indicators.distToVwapPct}% vs VWAP
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/60 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Intraday RSI (14)</span>
              {(() => {
                const rsi = data.indicators.rsi14[data.indicators.rsi14.length - 1]?.value ?? 50;
                return (
                  <>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">{rsi}</div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold block truncate ${
                        rsi < 35 ? 'text-emerald-400' : rsi > 65 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {rsi < 35 ? 'Oversold Scalp' : rsi > 65 ? 'Overbought' : 'Neutral'}
                    </span>
                  </>
                );
              })()}
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/60 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">ATR Volatility</span>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                ${data.indicators.atr14.toFixed(2)}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Target Range</span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/60 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">Floor Pivot (PP)</span>
              <div className="text-sm sm:text-base font-bold text-blue-400 mt-0.5 truncate">
                ${data.indicators.pivots.pp}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                R1: ${data.indicators.pivots.r1} • S1: ${data.indicators.pivots.s1}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/60 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase truncate">24h Range</span>
              <div className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1 truncate">
                H: <span className="text-emerald-400">${data.high24h}</span>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">
                L: <span className="text-rose-400">${data.low24h}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Markus Heitkoetter Market Clock & Golden Ratio OCO Engine */}
      <div>
        <ComponentPillTip
          layer="HEITKOETTER & Φ"
          title="Heitkoetter Intraday Clock & Golden Ratio (Φ = 1.618) OCO Engine"
          liveStatus="Market Session Phases • Golden Ratio Targets (1.618R & 2.618R) • 3-Strike Discipline Lockout"
          summary="From Markus Heitkoetter's 'A Complete Guide to Day Trading' combined with the Golden Ratio. Highlights session phases (avoiding the 11:30-13:30 ET Lunch Chop Danger Zone), formulates harmonic 1.618R bracket orders, and enforces the 3-strike circuit breaker."
          howToRead={[
            "Golden Window (10:00–11:30 ET): Prime intraday session for high-probability trend momentum.",
            "Lunch Chop Danger Zone (11:30–13:30 ET): DO NOT TRADE. Avoid fakeouts during midday volume drop.",
            "Golden Target (1.618R): Mathematically optimal reward target based on Φ = 1.618.",
            "3-Strike Circuit Breaker: If you sustain 3 losses today, shut down the terminal and walk away."
          ]}
          theme="amber"
        />
        <HeitkoetterGoldenEngine
          currentPrice={currentPrice}
          symbol={selectedSymbol}
          activeSetup={activeSetup}
        />
      </div>

      {/* Scalp Signal Cards Carousel / Matrix */}
      <div className="min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Algorithmic Scalp Signals ({data?.setups.length ?? 0} Active)
              </h2>
            </div>
            <ComponentPillTip
              layer="INTRADAY"
              title="Scalp Engine"
              liveStatus={`${data?.setups.length ?? 0} Setups • VWAP & EMA`}
              summary="Evaluates intraday VWAP standard deviation bands, EMA 9/21 momentum crosses, and key pivot levels to generate institutional Long and Short day trade setups."
              howToRead={[
                "Long Scalp: Price dipping below -1σ VWAP band or EMA 9/21 bull cross with upside target.",
                "Short Scalp: Overbought mean-reversion at +2σ VWAP or EMA 9/21 breakdown.",
                "Click any scalp card to plot exact Entry, 1.5x ATR Stop Loss, and TP1/TP2 on the chart.",
                "Risk Management: Automatically configures the position calculator to limit max risk to 1%."
              ]}
              theme="amber"
            />
          </div>
          <span className="font-mono text-[10px] sm:text-[11px] text-slate-400">
            Updated: {lastRefreshed}
          </span>
        </div>

        {data?.setups && data.setups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.setups.map((setup) => {
              const isSelected = activeSetup?.id === setup.id;
              const isLong = setup.direction === 'LONG';

              return (
                <div
                  key={setup.id}
                  onClick={() => setActiveSetup(setup)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all border relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? isLong
                        ? 'bg-[#0A1612] border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-[#190C10] border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                      : 'bg-[#090D16] border-slate-800/80 hover:border-slate-700 hover:bg-[#0B111C]'
                  }`}
                >
                  <div>
                    {/* Setup Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-black tracking-wider flex items-center gap-1 ${
                            isLong
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}
                        >
                          {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {setup.direction} SCALP
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {setup.symbol}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                        <span>⭐ {setup.confidence}% Quality</span>
                      </div>
                    </div>

                    {/* Setup Name & Rationale */}
                    <div className="mt-3">
                      <h3 className="font-mono text-xs font-bold text-slate-100">
                        {setup.setupName}
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {setup.rationale.slice(0, 2).map((r, idx) => (
                          <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target Price Levels */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 p-2 sm:p-2.5 rounded-xl bg-[#06080E] border border-slate-800/80 font-mono text-[10px] sm:text-[11px]">
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-slate-400 block uppercase truncate">Entry</span>
                        <span className="font-bold text-white truncate block">${setup.entryPrice}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-rose-400 block uppercase truncate">Stop Loss</span>
                        <span className="font-bold text-rose-400 truncate block">${setup.stopLoss}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-emerald-400 block uppercase truncate">TP2 (2.5R)</span>
                        <span className="font-bold text-emerald-400 truncate block">${setup.takeProfit2}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Risk/Reward: <strong className="text-emerald-400">{setup.riskRewardRatio}</strong></span>
                    <span className="text-blue-400 flex items-center gap-0.5">
                      {isSelected ? 'Currently Charted ✓' : 'Click to Chart →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#090D16] border border-slate-800 text-center font-mono text-xs text-slate-400">
            Scanning market structure for high-probability setups...
          </div>
        )}
      </div>

      {/* Main Intraday Chart & Risk Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {data && (
            <DayTradeChart
              candles={data.candles}
              indicators={data.indicators}
              activeSetup={activeSetup}
              symbol={data.symbol}
              timeframe={data.timeframe}
            />
          )}
        </div>

        <div>
          <DayTradeRiskCalculator setup={activeSetup} currentPrice={currentPrice} />
        </div>
      </div>
    </div>
  );
}

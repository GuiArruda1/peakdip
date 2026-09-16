'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import { DayTradeCandle, DayTradeIndicators, DayTradeSetup } from '@/lib/types';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface DayTradeChartProps {
  candles: DayTradeCandle[];
  indicators: DayTradeIndicators;
  activeSetup: DayTradeSetup | null;
  symbol: string;
  timeframe: string;
}

export default function DayTradeChart({
  candles,
  indicators,
  activeSetup,
  symbol,
  timeframe,
}: DayTradeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [showVwapBands, setShowVwapBands] = useState(true);
  const [showEmaRibbon, setShowEmaRibbon] = useState(true);
  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    vwap?: number;
  } | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Clean up previous chart instance
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (_) {}
      chartRef.current = null;
    }
    const isMobile = window.innerWidth < 640;
    const chartHeight = isMobile ? 320 : 440;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#090D16' },
        textColor: '#64748B',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#131A29' },
        horzLines: { color: '#131A29' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        scaleMargins: { top: 0.12, bottom: 0.12 },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E',
    });

    const candleData = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeries.setData(candleData);

    // 2. Session VWAP (Solid Gold)
    const vwapSeries = chart.addSeries(LineSeries, {
      color: '#F59E0B',
      lineWidth: 2,
      title: 'VWAP',
    });
    const vwapData = indicators.vwap.map((v) => ({ time: v.time as any, value: v.value }));
    vwapSeries.setData(vwapData);

    // 3. VWAP Standard Deviation Bands
    if (showVwapBands) {
      const upper1Series = chart.addSeries(LineSeries, {
        color: '#06B6D4',
        lineWidth: 1,
        lineStyle: 2, // Dotted
        title: '+1σ VWAP',
      });
      upper1Series.setData(indicators.vwapUpper1.map((v) => ({ time: v.time as any, value: v.value })));

      const lower1Series = chart.addSeries(LineSeries, {
        color: '#06B6D4',
        lineWidth: 1,
        lineStyle: 2,
        title: '-1σ VWAP',
      });
      lower1Series.setData(indicators.vwapLower1.map((v) => ({ time: v.time as any, value: v.value })));

      const upper2Series = chart.addSeries(LineSeries, {
        color: '#8B5CF6',
        lineWidth: 1,
        lineStyle: 2,
        title: '+2σ VWAP',
      });
      upper2Series.setData(indicators.vwapUpper2.map((v) => ({ time: v.time as any, value: v.value })));

      const lower2Series = chart.addSeries(LineSeries, {
        color: '#8B5CF6',
        lineWidth: 1,
        lineStyle: 2,
        title: '-2σ VWAP',
      });
      lower2Series.setData(indicators.vwapLower2.map((v) => ({ time: v.time as any, value: v.value })));
    }

    // 4. EMA 9 & 21 Ribbon
    if (showEmaRibbon) {
      const ema9Series = chart.addSeries(LineSeries, {
        color: '#10B981',
        lineWidth: 1,
        title: 'EMA 9',
      });
      ema9Series.setData(indicators.ema9.map((v) => ({ time: v.time as any, value: v.value })));

      const ema21Series = chart.addSeries(LineSeries, {
        color: '#FB7185',
        lineWidth: 1,
        title: 'EMA 21',
      });
      ema21Series.setData(indicators.ema21.map((v) => ({ time: v.time as any, value: v.value })));
    }

    // 5. Active Scalp Setup Price Target Overlays
    if (activeSetup) {
      // Entry Level
      candleSeries.createPriceLine({
        price: activeSetup.entryPrice,
        color: '#38BDF8',
        lineWidth: 1,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `ENTRY: $${activeSetup.entryPrice}`,
      });

      // Stop Loss Level
      candleSeries.createPriceLine({
        price: activeSetup.stopLoss,
        color: '#EF4444',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `SL: $${activeSetup.stopLoss}`,
      });

      // Take Profit 1
      candleSeries.createPriceLine({
        price: activeSetup.takeProfit1,
        color: '#10B981',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `TP1 (1.5R): $${activeSetup.takeProfit1}`,
      });

      // Take Profit 2
      candleSeries.createPriceLine({
        price: activeSetup.takeProfit2,
        color: '#34D399',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `TP2 (2.5R): $${activeSetup.takeProfit2}`,
      });
    }

    // Floor Pivot Price Lines (Subtle)
    if (indicators.pivots.pp > 0) {
      candleSeries.createPriceLine({
        price: indicators.pivots.pp,
        color: '#475569',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: false,
        title: 'Pivot PP',
      });
    }

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }

      const candle = param.seriesData.get(candleSeries) as any;
      const vwapVal = param.seriesData.get(vwapSeries) as any;

      if (candle) {
        const timeObj = new Date(Number(param.time) * 1000);
        setHoverData({
          time: timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          vwap: vwapVal?.value,
        });
      }
    });

    // Responsive window observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (_) {}
        chartRef.current = null;
      }
    };
  }, [candles, indicators, activeSetup, showVwapBands, showEmaRibbon]);

  return (
    <div className="relative w-full rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-2xl overflow-hidden">
      {/* Top Chart Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-[#070A10]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {symbol} • {timeframe} Intraday Scalp Chart
          </span>

          {hoverData && (
            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-300">
              <span>O: <strong className="text-white">${hoverData.open}</strong></span>
              <span>H: <strong className="text-emerald-400">${hoverData.high}</strong></span>
              <span>L: <strong className="text-rose-400">${hoverData.low}</strong></span>
              <span>C: <strong className="text-white">${hoverData.close}</strong></span>
              {hoverData.vwap && (
                <span>VWAP: <strong className="text-amber-400">${hoverData.vwap}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Indicator Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowVwapBands(!showVwapBands)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all border ${
              showVwapBands
                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {showVwapBands ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="hidden sm:inline">VWAP Bands (±1σ, ±2σ)</span>
            <span className="sm:hidden">VWAP</span>
          </button>

          <button
            onClick={() => setShowEmaRibbon(!showEmaRibbon)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all border ${
              showEmaRibbon
                ? 'bg-purple-950/60 border-purple-700/60 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {showEmaRibbon ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="hidden sm:inline">EMA Ribbon (9/21)</span>
            <span className="sm:hidden">EMA</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full" />

      {/* Legend & Target Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 bg-[#06080E] border-t border-slate-800/80 text-[10px] font-mono text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-400 rounded" />
            <strong className="text-amber-400">Session VWAP:</strong> ${indicators.currentVwap}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-400 rounded" />
            <strong className="text-emerald-400">EMA 9:</strong> ${indicators.ema9[indicators.ema9.length - 1]?.value ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-rose-400 rounded" />
            <strong className="text-rose-400">EMA 21:</strong> ${indicators.ema21[indicators.ema21.length - 1]?.value ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <strong className="text-slate-300">ATR(14):</strong> ${indicators.atr14}
          </span>
        </div>

        {activeSetup && (
          <div className="flex items-center gap-2 text-white">
            <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 font-bold">
              TARGETING {activeSetup.direction}
            </span>
            <span>R:R {activeSetup.riskRewardRatio}</span>
          </div>
        )}
      </div>
    </div>
  );
}
